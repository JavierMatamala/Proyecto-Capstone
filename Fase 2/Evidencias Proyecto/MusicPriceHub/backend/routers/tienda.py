from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from datetime import datetime

router = APIRouter(prefix="/api/tiendas", tags=["Tiendas"])

# -------------------------
# DEPENDENCIA DB
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# 🟩 1. CREAR TIENDA
# ============================================================
@router.post("/", summary="Crear una nueva tienda")
def crear_tienda(nombre: str, sitio_web: str | None = None, url: str | None = None,
                 db: Session = Depends(get_db)):

    existe = db.query(models.Tienda).filter(models.Tienda.nombre == nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail="La tienda ya existe")

    nueva = models.Tienda(
        nombre=nombre,
        sitio_web=sitio_web,
        url=url
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "message": "Tienda creada correctamente",
        "tienda": nueva
    }


# ============================================================
# 🟧 2. LISTAR TIENDAS
# ============================================================
@router.get("/", summary="Listar todas las tiendas")
def listar_tiendas(db: Session = Depends(get_db)):
    return db.query(models.Tienda).all()


# ============================================================
# 🟨 3. AGREGAR UN PRODUCTO A UNA TIENDA (TiendaProducto)
# ============================================================
@router.post("/agregar-producto", summary="Asociar tienda con producto y asignar URL del producto")
def agregar_tienda_producto(
    datos: schemas.TiendaProductoCrear,
    db: Session = Depends(get_db)
):
    tienda = db.query(models.Tienda).filter(models.Tienda.id == datos.tienda_id).first()
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    producto = db.query(models.Producto).filter(models.Producto.id == datos.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # 🔍 1. BUSCAR SI YA EXISTE
    existente = (
        db.query(models.TiendaProducto)
        .filter(
            models.TiendaProducto.tienda_id == datos.tienda_id,
            models.TiendaProducto.url_producto == datos.url_producto
        )
        .first()
    )

    # Si existe, lo devolvemos en vez de crear uno nuevo
    if existente:
        return {
            "message": "TiendaProducto ya existía, se reutiliza.",
            "tienda_producto": existente
        }

    # 🔧 2. CREAR SI NO EXISTE
    relacion = models.TiendaProducto(
        tienda_id=datos.tienda_id,
        producto_id=datos.producto_id,
        url_producto=datos.url_producto,
        sku_tienda=datos.sku_tienda
    )

    db.add(relacion)
    db.commit()
    db.refresh(relacion)

    return {
        "message": "Tienda asociada al producto correctamente",
        "tienda_producto": relacion
    }

# ============================================================
# 🟥 4. AGREGAR OFERTA DE PRECIO (OfertaActual)
# ============================================================
@router.post("/agregar-oferta", summary="Agregar o actualizar oferta de una tienda")
def agregar_oferta(
    datos: schemas.OfertaCrear,
    db: Session = Depends(get_db)
):

    tp = db.query(models.TiendaProducto).filter(
        models.TiendaProducto.id == datos.tienda_producto_id
    ).first()

    if not tp:
        raise HTTPException(status_code=404, detail="TiendaProducto no encontrado")

    # Buscar si la oferta ya existe (solo 1 oferta por tienda_producto)
    oferta_existente = db.query(models.OfertaActual).filter(
        models.OfertaActual.tienda_producto_id == datos.tienda_producto_id
    ).first()

    ahora = datetime.utcnow()

    # 🔄 Si la oferta existe → actualizarla
    if oferta_existente:
        oferta_existente.precio_centavos = datos.precio_centavos
        oferta_existente.disponibilidad = datos.disponibilidad
        oferta_existente.moneda = datos.moneda
        oferta_existente.fecha_scraping = ahora

        db.commit()
        db.refresh(oferta_existente)

        return {
            "message": "Oferta actualizada correctamente",
            "oferta": oferta_existente
        }

    # 🆕 Si NO existe → crear una nueva oferta
    nueva = models.OfertaActual(
        tienda_producto_id=tp.id,
        producto_id=tp.producto_id,
        tienda_id=tp.tienda_id,
        precio_centavos=datos.precio_centavos,
        disponibilidad=datos.disponibilidad,
        moneda=datos.moneda,
        fecha_listado=ahora,   # <──🔥 ESTA ERA LA CLAVE
        fecha_scraping=ahora   # <──🔥 OBLIGATORIO TAMBIÉN
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "message": "Oferta creada correctamente",
        "oferta": nueva
    }
