from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from utils.seguridad import get_current_user_optional
from models import (
    CategoriaForo, TemaForo, MensajeForo,
    LikeMensajeForo, ReporteMensajeForo, Usuario
)
from schemas import (
    CategoriaForoCrear, CategoriaForoMostrar,
    TemaForoCrear, TemaForoActualizar, TemaForoMostrar,
    MensajeForoCrear, MensajeForoActualizar, MensajeForoMostrar,
    LikeMensajeMostrar,
    ReporteMensajeCrear, ReporteMensajeMostrar,
)
from uuid import UUID
from datetime import datetime
from typing import Dict, Any

router = APIRouter(prefix="/comunidad", tags=["Comunidad"])


# Utilidad para verificar admin
def asegurar_admin(usuario: Usuario):
    if not usuario.es_admin:
        raise HTTPException(status_code=403, detail="Solo administradores pueden realizar esta acción")


# ============================
# CATEGORÍAS
# ============================

@router.post("/categorias", response_model=CategoriaForoMostrar)
def crear_categoria(
    data: CategoriaForoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    asegurar_admin(usuario)

    existente = db.query(CategoriaForo).filter(CategoriaForo.nombre == data.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    categoria = CategoriaForo(nombre=data.nombre, descripcion=data.descripcion)
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.get("/categorias", response_model=list[CategoriaForoMostrar])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(CategoriaForo).order_by(CategoriaForo.nombre.asc()).all()


# ============================
# TEMAS DEL FORO
# ============================

@router.post("/temas", response_model=TemaForoMostrar)
def crear_tema(
    data: TemaForoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    tema = TemaForo(
        titulo=data.titulo,
        categoria_id=data.categoria_id,
        creado_por=usuario.id,
    )
    db.add(tema)
    db.commit()
    db.refresh(tema)
    return tema


@router.get("/temas", response_model=list[TemaForoMostrar])
def listar_temas(
    db: Session = Depends(get_db),
    categoria_id: UUID | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = db.query(TemaForo)

    if categoria_id:
        query = query.filter(TemaForo.categoria_id == categoria_id)

    if search:
        query = query.filter(TemaForo.titulo.ilike(f"%{search}%"))

    query = query.order_by(TemaForo.fijado.desc(), TemaForo.actualizado_en.desc())

    offset = (page - 1) * page_size
    temas = query.offset(offset).limit(page_size).all()
    return temas


@router.patch("/temas/{tema_id}", response_model=TemaForoMostrar)
def actualizar_tema(
    tema_id: UUID,
    data: TemaForoActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    tema = db.query(TemaForo).filter(TemaForo.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")

    if tema.creado_por != usuario.id and not usuario.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado para editar este tema")

    if data.titulo is not None:
        tema.titulo = data.titulo
    if data.categoria_id is not None:
        tema.categoria_id = data.categoria_id
    if data.fijado is not None:
        asegurar_admin(usuario)
        tema.fijado = data.fijado
    if data.cerrado is not None:
        asegurar_admin(usuario)
        tema.cerrado = data.cerrado

    tema.actualizado_en = datetime.utcnow()
    db.commit()
    db.refresh(tema)
    return tema


# ============================
# MENSAJES
# ============================

@router.post("/temas/{tema_id}/mensajes", response_model=MensajeForoMostrar)
def crear_mensaje(
    tema_id: UUID,
    data: MensajeForoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    tema = db.query(TemaForo).filter(TemaForo.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
    if tema.cerrado:
        raise HTTPException(status_code=400, detail="El tema está cerrado")

    mensaje = MensajeForo(
        tema_id=tema_id,
        usuario_id=usuario.id,
        contenido=data.contenido,
        respuesta_a_id=data.respuesta_a_id,
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)

    tema.actualizado_en = datetime.utcnow()
    db.commit()

    return mensaje


@router.get("/temas/{tema_id}/mensajes", response_model=list[MensajeForoMostrar])
def listar_mensajes(
    tema_id: UUID,
    db: Session = Depends(get_db),
):
    return (
        db.query(MensajeForo)
        .filter(MensajeForo.tema_id == tema_id)
        .order_by(MensajeForo.creado_en.asc())
        .all()
    )


@router.patch("/mensajes/{mensaje_id}", response_model=MensajeForoMostrar)
def editar_mensaje(
    mensaje_id: UUID,
    data: MensajeForoActualizar,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    mensaje = db.query(MensajeForo).filter(MensajeForo.id == mensaje_id).first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    if mensaje.usuario_id != usuario.id and not usuario.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado para editar este mensaje")

    mensaje.contenido = data.contenido
    mensaje.editado = True
    mensaje.actualizado_en = datetime.utcnow()

    db.commit()
    db.refresh(mensaje)
    return mensaje


@router.delete("/mensajes/{mensaje_id}")
def eliminar_mensaje(
    mensaje_id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    mensaje = db.query(MensajeForo).filter(MensajeForo.id == mensaje_id).first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    if mensaje.usuario_id != usuario.id and not usuario.es_admin:
        raise HTTPException(status_code=403, detail="No autorizado para eliminar este mensaje")

    mensaje.eliminado = True
    mensaje.contenido = "[mensaje eliminado]"
    mensaje.actualizado_en = datetime.utcnow()

    db.commit()
    return {"detalle": "Mensaje eliminado correctamente"}


# ============================
# LIKES
# ============================

@router.post("/mensajes/{mensaje_id}/like", response_model=LikeMensajeMostrar)
def dar_like(
    mensaje_id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    mensaje = db.query(MensajeForo).filter(MensajeForo.id == mensaje_id).first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    existente = (
        db.query(LikeMensajeForo)
        .filter(LikeMensajeForo.mensaje_id == mensaje_id,
                LikeMensajeForo.usuario_id == usuario.id)
        .first()
    )
    if existente:
        raise HTTPException(status_code=400, detail="Ya has dado like a este mensaje")

    like = LikeMensajeForo(mensaje_id=mensaje_id, usuario_id=usuario.id)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like


@router.delete("/mensajes/{mensaje_id}/like")
def quitar_like(
    mensaje_id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    like = (
        db.query(LikeMensajeForo)
        .filter(LikeMensajeForo.mensaje_id == mensaje_id,
                LikeMensajeForo.usuario_id == usuario.id)
        .first()
    )
    if not like:
        raise HTTPException(status_code=404, detail="No tienes like en este mensaje")

    db.delete(like)
    db.commit()
    return {"detalle": "Like eliminado correctamente"}


# ============================
# REPORTES Y MODERACIÓN
# ============================

@router.post("/mensajes/{mensaje_id}/reportes", response_model=ReporteMensajeMostrar)
def reportar_mensaje(
    mensaje_id: UUID,
    data: ReporteMensajeCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    mensaje = db.query(MensajeForo).filter(MensajeForo.id == mensaje_id).first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    reporte = ReporteMensajeForo(
        mensaje_id=mensaje_id,
        usuario_id=usuario.id,
        motivo=data.motivo,
    )
    db.add(reporte)
    db.commit()
    db.refresh(reporte)
    return reporte


@router.get("/reportes/mensajes", response_model=list[ReporteMensajeMostrar])
def listar_reportes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    asegurar_admin(usuario)
    return (
        db.query(ReporteMensajeForo)
        .order_by(ReporteMensajeForo.creado_en.desc())
        .all()
    )


@router.patch("/reportes/mensajes/{reporte_id}", response_model=ReporteMensajeMostrar)
def resolver_reporte(
    reporte_id: UUID,
    nuevo_estado: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional),
):
    asegurar_admin(usuario)

    reporte = db.query(ReporteMensajeForo).filter(ReporteMensajeForo.id == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")

    if nuevo_estado not in ["pendiente", "revisado", "descartado"]:
        raise HTTPException(status_code=400, detail="Estado inválido")

    reporte.estado = nuevo_estado
    reporte.resuelto_en = datetime.utcnow()
    reporte.resuelto_por = usuario.id

    db.commit()
    db.refresh(reporte)
    return reporte

@router.get("/temas/{tema_id}/detalle")
def obtener_tema_con_árbol(
    tema_id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user_optional)
):
    # Verificar que el tema exista
    tema = db.query(TemaForo).filter(TemaForo.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")

    # Obtener todos los mensajes del tema
    mensajes = (
        db.query(MensajeForo)
        .filter(MensajeForo.tema_id == tema_id)
        .order_by(MensajeForo.creado_en.asc())
        .all()
    )

    # Convertir a diccionario por ID
    mapa = {m.id: m for m in mensajes}

    # Lista final de mensajes raíz
    arbol = []

    # Preparar estructura recursiva
    def construir_nodo(mensaje):
        return {
            "id": mensaje.id,
            "usuario_id": mensaje.usuario_id,
            "contenido": mensaje.contenido,
            "creado_en": mensaje.creado_en,
            "actualizado_en": mensaje.actualizado_en,
            "editado": mensaje.editado,
            "eliminado": mensaje.eliminado,
            "respuesta_a_id": mensaje.respuesta_a_id,
            "respuestas": []
        }

    nodos = {m.id: construir_nodo(m) for m in mensajes}

    # Armar árbol
    for mensaje in mensajes:
        nodo = nodos[mensaje.id]
        if mensaje.respuesta_a_id:
            # agregar al padre
            nodos[mensaje.respuesta_a_id]["respuestas"].append(nodo)
        else:
            # mensaje raíz
            arbol.append(nodo)

    return {
        "tema": {
            "id": tema.id,
            "titulo": tema.titulo,
            "creado_por": tema.creado_por,
            "creado_en": tema.creado_en,
            "actualizado_en": tema.actualizado_en,
            "fijado": tema.fijado,
            "cerrado": tema.cerrado,
            "categoria_id": tema.categoria_id
        },
        "mensajes": arbol
    }


@router.get("/temas/{tema_id}/detalle-frontend")
def detalle_tema_frontend(
    tema_id: UUID,
    db: Session = Depends(get_db),
    usuario_actual = Depends(get_current_user_optional),
):
    # 1) Verificar que el tema exista
    tema = db.query(TemaForo).filter(TemaForo.id == tema_id).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")

    # 2) Obtener todos los mensajes del tema
    mensajes = (
        db.query(MensajeForo)
        .filter(MensajeForo.tema_id == tema_id)              # ← aquí usamos tema_id
        .order_by(MensajeForo.creado_en.asc())
        .all()
    )

    # 3) Construir mapa de mensajes para el frontend (formato C)
    mapa: Dict[str, Dict[str, Any]] = {}
    raices: list[str] = []

    for m in mensajes:
        # usuario_actual puede ser None (autenticación opcional)
        me_gusta = False
        if usuario_actual:
            me_gusta = any(l.usuario_id == usuario_actual.id for l in m.likes)

        perfil = m.usuario.perfil if m.usuario and hasattr(m.usuario, "perfil") else None
        nombre_publico = (
            perfil.nombre_publico if perfil and perfil.nombre_publico else "Usuario"
        )
        avatar_url = perfil.avatar_url if perfil and perfil.avatar_url else None

        mapa[str(m.id)] = {
            "id": str(m.id),
            "tema_id": str(m.tema_id),
            "usuario": {
                "id": str(m.usuario_id),
                "nombre_publico": nombre_publico,
                "avatar_url": avatar_url,
            },
            "contenido": m.contenido,
            "creado_en": m.creado_en,
            "actualizado_en": m.actualizado_en,
            "editado": m.editado,
            "eliminado": m.eliminado,
            "respuesta_a_id": str(m.respuesta_a_id) if m.respuesta_a_id else None,
            "respuestas": [],
            "nivel": 0,
            "likes": len(m.likes),
            "me_gusta": me_gusta,
            "cantidad_respuestas": 0,
        }

    # 4) Armar árbol padre → hijos
    for datos in mapa.values():
        if datos["respuesta_a_id"]:
            padre_id = datos["respuesta_a_id"]
            if padre_id in mapa:
                mapa[padre_id]["respuestas"].append(datos["id"])
        else:
            raices.append(datos["id"])

    # 5) Calcular niveles
    def asignar_nivel(mid: str, nivel: int):
        mapa[mid]["nivel"] = nivel
        for hijo_id in mapa[mid]["respuestas"]:
            asignar_nivel(hijo_id, nivel + 1)

    for rid in raices:
        asignar_nivel(rid, 0)

    # 6) Contar respuestas directas
    for mid, datos in mapa.items():
        datos["cantidad_respuestas"] = len(datos["respuestas"])

    return {
        "tema": {
            "id": str(tema.id),
            "titulo": tema.titulo,
            "categoria_id": str(tema.categoria_id) if tema.categoria_id else None,
            "creado_por": str(tema.creado_por),
            "creado_en": tema.creado_en,
            "actualizado_en": tema.actualizado_en,
            "fijado": tema.fijado,
            "cerrado": tema.cerrado,
        },
        "mensajes": {
            "raices": raices,
            "mapa": mapa,
        },
    }