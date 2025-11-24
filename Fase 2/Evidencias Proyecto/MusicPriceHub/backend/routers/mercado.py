from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pathlib import Path
import uuid

import models, schemas
from database import get_db
from utils.seguridad import get_current_user

router = APIRouter(
    prefix="/mercado",
    tags=["Mercado"],
)

# Helper para construir la respuesta detallada
def build_publicacion_detalle(
    pub: models.PublicacionMercado,
    db: Session,
) -> schemas.PublicacionMercadoMostrar:
    vendedor = pub.vendedor
    perfil = getattr(vendedor, "perfil", None)

    datos_vendedor = schemas.DatosVendedor(
        id=vendedor.id,
        correo=vendedor.correo,
        nombre_publico=perfil.nombre_publico if perfil else None,
        avatar_url=perfil.avatar_url if perfil else None,
    )

    imagenes = [
        schemas.ImagenPublicacionMostrar.from_orm(img)
        for img in sorted(pub.imagenes, key=lambda i: i.orden or 0)
    ]

    return schemas.PublicacionMercadoMostrar(
        id=pub.id,
        titulo=pub.titulo,
        descripcion=pub.descripcion,
        producto_id=pub.producto_id,
        precio_centavos=pub.precio_centavos,
        moneda=pub.moneda,
        ciudad=pub.ciudad,
        estado=pub.estado,
        creada_en=pub.creada_en,
        actualizada_en=pub.actualizada_en,
        vendedor=datos_vendedor,
        imagenes=imagenes,
    )


# ============================
# POST /mercado/publicaciones → Crear publicación
# ============================
@router.post(
    "/publicaciones",
    response_model=schemas.PublicacionMercadoMostrar,
    status_code=status.HTTP_201_CREATED,
)
def crear_publicacion(
    data: schemas.PublicacionMercadoCrear,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(get_current_user),
):
    pub = models.PublicacionMercado(
        vendedor_id=usuario_actual.id,
        titulo=data.titulo,
        descripcion=data.descripcion,
        producto_id=data.producto_id,
        precio_centavos=data.precio_centavos,
        moneda=data.moneda,
        ciudad=data.ciudad,
        estado="activa",
    )
    db.add(pub)
    db.flush()  # para tener pub.id

    # Si vienen URLs de imágenes ya seteadas en el body (opcional)
    for i, img in enumerate(data.imagenes):
        db.add(
            models.ImagenPublicacion(
                publicacion_id=pub.id,
                url_imagen=img.url_imagen,
                orden=img.orden if img.orden is not None else i,
            )
        )

    db.commit()
    db.refresh(pub)

    return build_publicacion_detalle(pub, db)


# ============================
# POST /mercado/publicaciones/{id}/imagenes → Subir fotos (archivos)
# ============================
@router.post(
    "/publicaciones/{publicacion_id}/imagenes",
    response_model=List[schemas.ImagenPublicacionMostrar],
    status_code=status.HTTP_201_CREATED,
)
async def subir_imagenes_publicacion(
    publicacion_id: UUID,
    archivos: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(get_current_user),
):
    # 1) Verificar que la publicación exista
    pub = (
        db.query(models.PublicacionMercado)
        .filter(models.PublicacionMercado.id == publicacion_id)
        .first()
    )
    if not pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")

    # 2) Verificar que el usuario sea el vendedor o admin
    if pub.vendedor_id != usuario_actual.id and not getattr(
        usuario_actual, "es_admin", False
    ):
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para subir imágenes a esta publicación",
        )

    # 3) Carpeta destino: media/mercado/<publicacion_id>/
    base_dir = Path("media") / "mercado" / str(publicacion_id)
    base_dir.mkdir(parents=True, exist_ok=True)

    # 4) Calcular orden inicial según imágenes existentes
    max_orden = (
        db.query(models.ImagenPublicacion)
        .filter(models.ImagenPublicacion.publicacion_id == publicacion_id)
        .order_by(models.ImagenPublicacion.orden.desc())
        .first()
    )
    orden_actual = max_orden.orden + 1 if max_orden else 0

    imagenes_creadas: List[models.ImagenPublicacion] = []
    extensiones_permitidas = {".jpg", ".jpeg", ".png", ".webp"}

    # 5) Guardar cada archivo
    for archivo in archivos:
        ext = Path(archivo.filename).suffix.lower()
        if ext not in extensiones_permitidas:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de archivo no permitido: {ext}",
            )

        nombre_archivo = f"{uuid.uuid4()}{ext}"
        ruta_fisica = base_dir / nombre_archivo

        # Guardar archivo en disco
        with open(ruta_fisica, "wb") as buffer:
            contenido = await archivo.read()
            buffer.write(contenido)

        # URL pública (serviremos /media como estático)
        url_publica = f"/media/mercado/{publicacion_id}/{nombre_archivo}"

        img = models.ImagenPublicacion(
            publicacion_id=publicacion_id,
            url_imagen=url_publica,
            orden=orden_actual,
        )
        db.add(img)
        imagenes_creadas.append(img)
        orden_actual += 1

    db.commit()

    # Refrescar para obtener los IDs
    for img in imagenes_creadas:
        db.refresh(img)

    return [schemas.ImagenPublicacionMostrar.from_orm(img) for img in imagenes_creadas]


# ============================
# GET /mercado/publicaciones → Listar marketplace
# ============================
@router.get(
    "/publicaciones",
    response_model=List[schemas.PublicacionMercadoListado],
)
def listar_publicaciones(
    ciudad: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.PublicacionMercado).filter(
        models.PublicacionMercado.estado == "activa"
    )

    if ciudad:
        query = query.filter(models.PublicacionMercado.ciudad.ilike(f"%{ciudad}%"))
    if q:
        like = f"%{q}%"
        query = query.filter(
            models.PublicacionMercado.titulo.ilike(like)
            | models.PublicacionMercado.descripcion.ilike(like)
        )

    pubs = query.order_by(models.PublicacionMercado.creada_en.desc()).all()

    resultado: List[schemas.PublicacionMercadoListado] = []
    for p in pubs:
        perfil = p.vendedor.perfil if p.vendedor else None
        resultado.append(
            schemas.PublicacionMercadoListado(
                id=p.id,
                titulo=p.titulo,
                precio_centavos=p.precio_centavos,
                moneda=p.moneda,
                ciudad=p.ciudad,
                imagen_principal=p.imagenes[0].url_imagen if p.imagenes else None,
                vendedor_nombre=perfil.nombre_publico if perfil else None,
            )
        )

    return resultado


# ============================
# GET /mercado/publicaciones/{id} → Detalle
# ============================
@router.get(
    "/publicaciones/{publicacion_id}",
    response_model=schemas.PublicacionMercadoMostrar,
)
def obtener_publicacion(
    publicacion_id: UUID,
    db: Session = Depends(get_db),
):
    pub = db.query(models.PublicacionMercado).filter_by(id=publicacion_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    return build_publicacion_detalle(pub, db)


# ============================
# GET /mercado/mis-publicaciones → Avisos del vendedor logueado
# ============================
@router.get(
    "/mis-publicaciones",
    response_model=List[schemas.PublicacionMercadoListado],
)
def mis_publicaciones(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(get_current_user),
):
    pubs = (
        db.query(models.PublicacionMercado)
        .filter(models.PublicacionMercado.vendedor_id == usuario_actual.id)
        .order_by(models.PublicacionMercado.creada_en.desc())
        .all()
    )

    resultado: List[schemas.PublicacionMercadoListado] = []
    for p in pubs:
        perfil = p.vendedor.perfil if p.vendedor else None
        resultado.append(
            schemas.PublicacionMercadoListado(
                id=p.id,
                titulo=p.titulo,
                precio_centavos=p.precio_centavos,
                moneda=p.moneda,
                ciudad=p.ciudad,
                imagen_principal=p.imagenes[0].url_imagen if p.imagenes else None,
                vendedor_nombre=perfil.nombre_publico if perfil else None,
            )
        )

    return resultado


# ============================
# PATCH /mercado/publicaciones/{id}/estado → Cambiar estado
# ============================
@router.patch(
    "/publicaciones/{publicacion_id}/estado",
    response_model=schemas.PublicacionMercadoMostrar,
)
def cambiar_estado_publicacion(
    publicacion_id: UUID,
    nuevo_estado: str,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(get_current_user),
):
    pub = db.query(models.PublicacionMercado).filter_by(id=publicacion_id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")

    # Solo el dueño (o admin) puede cambiar estado
    if pub.vendedor_id != usuario_actual.id and not usuario_actual.es_admin:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para editar esta publicación"
        )

    pub.estado = nuevo_estado
    db.commit()
    db.refresh(pub)
    return build_publicacion_detalle(pub, db)
