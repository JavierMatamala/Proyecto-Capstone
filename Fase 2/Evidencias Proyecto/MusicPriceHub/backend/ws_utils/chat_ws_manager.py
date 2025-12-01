from typing import Dict, List
from fastapi import WebSocket

# Manager de chats por sala
class ChatManager:
    def __init__(self):
        self.active_chats: Dict[str, List[WebSocket]] = {}  # conversacion_id -> sockets

    async def connect(self, conversacion_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_chats.setdefault(conversacion_id, []).append(websocket)

    def disconnect(self, conversacion_id: str, websocket: WebSocket):
        if conversacion_id in self.active_chats:
            self.active_chats[conversacion_id].remove(websocket)
            if not self.active_chats[conversacion_id]:
                del self.active_chats[conversacion_id]

    async def broadcast(self, conversacion_id: str, data: dict):
        for ws in self.active_chats.get(conversacion_id, []):
            await ws.send_json(data)

chat_manager = ChatManager()

# Manager global de notificaciones
class NotificationManager:
    def __init__(self):
        self.active_users: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_users[user_id] = websocket

    def disconnect(self, user_id: str):
        self.active_users.pop(user_id, None)

    async def send_to_user(self, user_id: str, data: dict):
        if user_id in self.active_users:
            await self.active_users[user_id].send_json(data)

notification_manager = NotificationManager()