from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from uuid import UUID
from models import Conversacion, Mensaje,Perfil
from schemas import ConversacionCrear, ConversacionOut, MensajeCrear, ConversacionResponse, MensajeResponse,UltimoMensajeResponse,ConversacionListaResponse
import uuid
from datetime import datetime
from sqlalchemy import or_, and_
router = APIRouter(prefix="/api/chat", tags=["Chat Marketplace"])

# ===========================================
# 🟦 1. Crear conversación por publicación
# ===========================================

def crear_conversacion_db(datos: ConversacionCrear, db: Session):
    usuario1 = datos.usuario1_id
    usuario2 = datos.usuario2_id

    # ordenar para evitar duplicidad invertida
    if str(usuario2) < str(usuario1):
        usuario1, usuario2 = usuario2, usuario1

    existente = (
        db.query(Conversacion)
        .filter(
            Conversacion.usuario1_id == usuario1,
            Conversacion.usuario2_id == usuario2,
            Conversacion.publicacion_id == datos.publicacion_id,
        )
        .first()
    )

    if existente:
        return existente

    conversacion = Conversacion(
        usuario1_id=usuario1,
        usuario2_id=usuario2,
        publicacion_id=datos.publicacion_id,
    )

    db.add(conversacion)
    db.commit()
    db.refresh(conversacion)
    return conversacion

@router.post("/conversacion/crear", response_model=ConversacionOut)
def crear_conversacion(datos: ConversacionCrear, db: Session = Depends(get_db)):
    return crear_conversacion_db(datos, db)


# ===========================================
# 🟩 2. Enviar mensaje
# ===========================================
@router.post("/mensajes/enviar")
def enviar_mensaje(datos: MensajeCrear, db: Session = Depends(get_db)):

    conversacion = db.query(Conversacion).filter(
        Conversacion.id == datos.conversacion_id
    ).first()

    if not conversacion:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    mensaje = Mensaje(
        conversacion_id=datos.conversacion_id,
        remitente_id=datos.remitente_id,
        receptor_id=datos.receptor_id,
        contenido=datos.contenido
    )

    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)

    return mensaje


# ===========================================
# 🟨 3. Obtener mensajes por conversación
# ===========================================
@router.get("/mensajes/{conversacion_id}", response_model=list[MensajeResponse])
def obtener_mensajes(conversacion_id: str, db: Session = Depends(get_db)):
    mensajes = (
        db.query(Mensaje)
        .filter(Mensaje.conversacion_id == conversacion_id)
        .order_by(Mensaje.enviado_en.asc())
        .all()
    )

    # Convertir UUID → string antes de enviar la respuesta
    mensajes_formateados = []
    for m in mensajes:
        mensajes_formateados.append({
            "id": str(m.id),
            "conversacion_id": str(m.conversacion_id),
            "remitente_id": str(m.remitente_id),
            "receptor_id": str(m.receptor_id),
            "contenido": m.contenido,
            "enviado_en": m.enviado_en,
            "leido": m.leido
        })

    return mensajes_formateados


# ===========================================
# 🟪 4. Listar conversaciones de un usuario
# ===========================================
from models import Usuario  # importa modelo Usuario
from sqlalchemy import or_

@router.get("/conversaciones/usuario/{usuario_id}")
def listar_conversaciones_usuario(usuario_id: uuid.UUID, db: Session = Depends(get_db)):

    # 1. Obtener conversaciones donde participa usuario
    conversaciones = (
        db.query(Conversacion)
        .filter(
            or_(
                Conversacion.usuario1_id == usuario_id,
                Conversacion.usuario2_id == usuario_id,
            )
        )
        .all()
    )

    if not conversaciones:
        return []

    resultado = []

    for c in conversaciones:

        # 2. Último mensaje
        ultimo_mensaje = (
            db.query(Mensaje)
            .filter(Mensaje.conversacion_id == c.id)
            .order_by(Mensaje.enviado_en.desc())
            .first()
        )

        # 3. Obtener el otro usuario
        otro_usuario_id = c.usuario2_id if c.usuario1_id == usuario_id else c.usuario1_id
        otro_usuario = db.query(Usuario).filter(Usuario.id == otro_usuario_id).first()

        resultado.append({
            "conversacion_id": c.id,
            "publicacion_id": c.publicacion_id,
            "ultimo_mensaje": ultimo_mensaje.contenido if ultimo_mensaje else None,
            "enviado_en": ultimo_mensaje.enviado_en if ultimo_mensaje else None,
            "otro_usuario": {
                "id": otro_usuario.id,
                "nombre": otro_usuario.perfil.nombre_publico if otro_usuario and otro_usuario.perfil else "Usuario",
            },
        })

    return resultado

# ===========================================
# 🟪 4. Buscar chat de marketplace
# ===========================================
from models import Usuario  # importa modelo Usuario
from sqlalchemy import or_

@router.get("/conversaciones/usuario/create/{usuario_id}/{usuario_id2}/{publicacion_id}")
def listar_conversaciones_usuario(usuario_id: uuid.UUID,usuario_id2: uuid.UUID, publicacion_id: uuid.UUID, db: Session = Depends(get_db)):
    # 1. Obtener conversaciones donde participa usuario
    conversacion = (
    db.query(Conversacion)
        .filter(
            or_(
                and_(
                    Conversacion.usuario1_id == usuario_id,
                    Conversacion.usuario2_id == usuario_id2
                ),
                and_(
                    Conversacion.usuario1_id == usuario_id2,
                    Conversacion.usuario2_id == usuario_id
                )
            )
        )
        .first()
    )

    if not conversacion:
        #Se confeccionan los datos para crear la conversación
        data = ConversacionCrear(
            usuario1_id=usuario_id,
            usuario2_id=usuario_id2,
            publicacion_id=publicacion_id
        )
        #Se crea conversación nueva
        nuevaConversacion = crear_conversacion_db(data,db)
        resultado = {
            "conversacion": nuevaConversacion,
            "mensajes": [],
            "nuevo": True
        }
        #Si no existe se crea una nueva conversación
        return resultado
    #Si existe la conversación entonces retorna el chat y los mensajes
    mensajes = db.query(Mensaje).filter(Mensaje.conversacion_id == conversacion.id).order_by(Mensaje.enviado_en.desc()).all()

    resultado = {
        "conversacion": conversacion,
        "mensajes": mensajes,
        "nuevo": False
    }

    return resultado

