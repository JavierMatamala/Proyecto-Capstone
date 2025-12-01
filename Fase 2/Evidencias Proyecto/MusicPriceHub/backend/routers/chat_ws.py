from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect
from sqlalchemy.orm import Session
import json
from uuid import UUID

from database import get_db
from utils.seguridad import get_current_user
from models import Conversacion, Mensaje
from ws_utils.chat_ws_manager import NotificationManager
from ws_utils.chat_ws_manager import ChatManager

chat_manager = ChatManager()
notification_manager = NotificationManager()
router = APIRouter(tags=["Chat WebSocket"])

@router.websocket("/api/chat/ws/chat/{conversacion_id}")
async def chat_ws(websocket: WebSocket, conversacion_id: str, db: Session = Depends(get_db)):
    await chat_manager.connect(conversacion_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            # Guardar en BD
            mensaje = Mensaje(
                conversacion_id=UUID(conversacion_id),
                remitente_id = UUID(data["remitente_id"]),
                receptor_id = UUID(data["receptor_id"]),
                contenido=data["contenido"]
            )
            db.add(mensaje)
            db.commit()
            db.refresh(mensaje)

            # Broadcast a la sala
            await chat_manager.broadcast(conversacion_id, {
                "id": str(mensaje.id),
                "remitente_id": str(data["remitente_id"]),
                "receptor_id":  str(data["receptor_id"]),
                "leido": False,
                "enviado_en": "",
                "contenido": mensaje.contenido,
            })

            # Notificación global al receptor
            await notification_manager.send_to_user(
                str(mensaje.receptor_id),
                {
                    "tipo": "notificacion",
                    "mensaje": f"Nuevo mensaje de {mensaje.remitente_id}",
                    "conversacion_id": conversacion_id
                }
            )
    except WebSocketDisconnect:
        chat_manager.disconnect(conversacion_id, websocket)

@router.websocket("/api/chat/ws/notifications/{user_id}")
async def notifications_ws(websocket: WebSocket, user_id: str):
    await notification_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_manager.disconnect(user_id)

