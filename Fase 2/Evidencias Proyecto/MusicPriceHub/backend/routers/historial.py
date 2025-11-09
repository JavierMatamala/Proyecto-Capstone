from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models

router = APIRouter(prefix="/api/historial", tags=["Historial de Precios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{producto_id}")
def historial_producto(producto_id: str, db: Session = Depends(get_db)):
    producto = db.query(models.Producto)\
        .options(joinedload(models.Producto.historial))\
        .filter(models.Producto.id == producto_id)\
        .first()
    if not producto:
        return {"mensaje": "Producto no encontrado"}
    return {
        "producto": producto.nombre,
        "historial": [
            {"fecha": h.fecha, "precio": h.precio} for h in producto.historial
        ]
    }
