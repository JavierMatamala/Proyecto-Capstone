from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Crear la aplicación
app = FastAPI(title="MusicPrice Hub API")

# ============================
# CONFIGURACIÓN CORS
# ============================
origins = [
    "http://localhost:3000",          # Frontend local (Next.js)
    "https://localhost:3000",         # Por si usas https local
    "https://musicpricehub.onrender.com",  # API en Render
    # "*"  # OPCIONAL: permitir todo mientras desarrollas (si tienes problemas)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

# Crear las tablas (solo si no existen)
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Bienvenido a MusicPrice Hub API 🚀"}
