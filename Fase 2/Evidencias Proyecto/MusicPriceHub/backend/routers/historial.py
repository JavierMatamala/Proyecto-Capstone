from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
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
        JOIN catalogo.tienda_productos tp
            ON tp.id = h.tienda_producto_id
        JOIN catalogo.tiendas t
            ON t.id = tp.tienda_id
        WHERE tp.producto_id = :pid
        ORDER BY fecha ASC;
    """

    try:
        result = db.execute(text(sql), {"pid": producto_id}).fetchall()
    except Exception as e:
        print("❌ ERROR SQL:", e)
        raise HTTPException(status_code=500, detail="Error interno en historial")

    historial = [
        {
            "precio_centavos": row.precio_centavos,
            "moneda": row.moneda,
            "fecha": row.fecha,
            "tienda": row.tienda,
        }
        for row in result
    ]

    return historial
