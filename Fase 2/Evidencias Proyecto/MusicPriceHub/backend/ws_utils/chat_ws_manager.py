from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, conversacion_id: str, websocket: WebSocket):
        await websocket.accept()

        if conversacion_id not in self.active_connections:
            self.active_connections[conversacion_id] = []

        self.active_connections[conversacion_id].append(websocket)

    def disconnect(self, conversacion_id: str, websocket: WebSocket):
        if conversacion_id in self.active_connections:
            self.active_connections[conversacion_id].remove(websocket)

            if len(self.active_connections[conversacion_id]) == 0:
                del self.active_connections[conversacion_id]

    async def broadcast(self, conversacion_id: str, data: dict):
        if conversacion_id in self.active_connections:
            for connection in self.active_connections[conversacion_id]:
                await connection.send_json(data)
