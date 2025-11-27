from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal

router = APIRouter(prefix="/api/precios", tags=["Historial de Precios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/historial/{producto_id}")
def historial_precios(producto_id: str, db: Session = Depends(get_db)):

    sql = """
        SELECT 
            h.precio_centavos,
            h.moneda,
            h.fecha_scraping AS fecha,
            t.nombre AS tienda
        FROM precios.historial_precios h
        JOIN precios.ofertas_actuales o 
            ON o.tienda_producto_id = h.tienda_producto_id
        JOIN catalogo.tienda t
            ON t.id = o.tienda_id
        WHERE o.producto_id = :pid
        ORDER BY fecha ASC;
    """

    rows = db.execute(sql, {"pid": producto_id}).fetchall()

    historial = [
        {
            "precio_centavos": r.precio_centavos,
            "moneda": r.moneda,
            "fecha": r.fecha,
            "tienda": r.tienda
        }
        for r in rows
    ]

    return historial
