from fastapi import FastAPI
from database import Base, engine
from routers import productos, historial,alertas,scraping


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Comparador de Precios",
    description="API REST con relaciones entre productos, tiendas y precios",
    version="1.1.0"
)

app.include_router(productos.router)
app.include_router(historial.router)
app.include_router(scraping.router)

@app.get("/")
def inicio():
    return {"mensaje": "Bienvenido a la API del Comparador de Precios"}

app.include_router(productos.router)
app.include_router(alertas.router)

