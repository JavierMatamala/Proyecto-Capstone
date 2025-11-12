from fastapi import FastAPI
from database import Base, engine
from routers import productos, historial, alertas, scraping, auth, perfil
from fastapi.middleware.cors import CORSMiddleware

# Crear tablas
Base.metadata.create_all(bind=engine)

# Inicializar la app
app = FastAPI(
    title="API Comparador de Precios",
    description="API REST con relaciones entre productos, tiendas y precios",
    version="1.1.0"
)

# 🔹 Configurar CORS ANTES de los routers
origins = [
    "http://localhost:5173",                    # React local
    "https://musicpricehub-site.onrender.com",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Rutas
app.include_router(productos.router)
app.include_router(historial.router)
app.include_router(scraping.router)
app.include_router(alertas.router)
app.include_router(auth.router)
app.include_router(perfil.router)

# 🔹 Ruta raíz
@app.get("/")
def inicio():
    return {"mensaje": "Bienvenido a la API del Comparador de Precios"}