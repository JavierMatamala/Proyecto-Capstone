from fastapi import FastAPI
from database import Base, engine
from routers import productos, historial, alertas, scraping, auth, perfil, comunidad, mercado
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from routers.chat import router as chat_router
from routers.chat_ws import router as chat_ws_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Comparador de Precios",
    description="API REST con relaciones entre productos, tiendas y precios",
    version="1.1.0"
)

os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")



origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "https://musicpricehub.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(productos.router)
app.include_router(historial.router)
app.include_router(scraping.router)
app.include_router(alertas.router)
app.include_router(auth.router)
app.include_router(perfil.router)
app.include_router(comunidad.router)
app.include_router(mercado.router)

# Integración final
app.include_router(chat_router)
app.include_router(chat_ws_router)

@app.get("/")
def inicio():
    return {"mensaje": "Bienvenido a la API del Comparador de Precios"}
