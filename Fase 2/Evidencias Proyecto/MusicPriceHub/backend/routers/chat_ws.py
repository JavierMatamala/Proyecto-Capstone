from fastapi import APIRouter, WebSocket, Depends
from sqlalchemy.orm import Session
import json
from uuid import UUID

from database import get_db
from utils.seguridad import get_current_user
from models import Conversacion, Mensaje
from ws_utils.chat_ws_manager import ConnectionManager

manager = ConnectionManager()
router = APIRouter(tags=["Chat WebSocket"])


@router.websocket("/api/chat/ws/{conversacion_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversacion_id: str,
    db: Session = Depends(get_db),
):

    # 1. Conectar
    await manager.connect(conversacion_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            remitente_id = UUID(data["remitente_id"])
            receptor_id = UUID(data["receptor_id"])
            contenido = data["contenido"]

            # 2. Guardar en BD
            mensaje = Mensaje(
                conversacion_id=UUID(conversacion_id),
                remitente_id=remitente_id,
                receptor_id=receptor_id,
                contenido=contenido
            )

            db.add(mensaje)
            db.commit()
            db.refresh(mensaje)

            # 3. Enviar mensaje a todos los conectados en tiempo real
            await manager.broadcast(
                conversacion_id,
                {
                    "id": str(mensaje.id),
                    "conversacion_id": conversacion_id,
                    "remitente_id": str(remitente_id),
                    "receptor_id": str(receptor_id),
                    "contenido": contenido,
                    "enviado_en": str(mensaje.enviado_en),
                    "leido": mensaje.leido
                }
            )

    except Exception:
        pass

    finally:
        # 4. desconectar
        manager.disconnect(conversacion_id, websocket)
