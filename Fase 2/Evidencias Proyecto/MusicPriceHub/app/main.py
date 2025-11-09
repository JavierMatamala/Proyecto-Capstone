from fastapi import FastAPI
from app.database import Base, engine

# Crear la aplicación
app = FastAPI(title="MusicPrice Hub API")

# Crear las tablas (solo si no existen)
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Bienvenido a MusicPrice Hub API 🚀"}
