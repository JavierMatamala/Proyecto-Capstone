from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas
from datetime import datetime
from uuid import UUID

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
def crear_tienda(datos: schemas.TiendaCrear, db: Session = Depends(get_db)):

    existe = db.query(models.Tienda).filter(models.Tienda.nombre == datos.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail="La tienda ya existe")

    nueva = models.Tienda(
        nombre=datos.nombre,
        sitio_web=datos.sitio_web,
        url=datos.url
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
# 🟨 3. LISTAR TIENDAS ASOCIADAS A UN PRODUCTO
# ============================================================
@router.get("/producto/{producto_id}", summary="Listar tiendas asociadas a un producto")
def listar_tiendas_de_producto(producto_id: UUID, db: Session = Depends(get_db)):

    filas = (
        db.query(models.TiendaProducto, models.Tienda.nombre)
        .join(models.Tienda, models.Tienda.id == models.TiendaProducto.tienda_id)
        .filter(models.TiendaProducto.producto_id == producto_id)
        .all()
    )

    resultado = []
    for tp, tienda_nombre in filas:
        resultado.append({
            "id": tp.id,
            "tienda_id": tp.tienda_id,
            "producto_id": tp.producto_id,
            "tienda_nombre": tienda_nombre,
            "url_producto": tp.url_producto
        })

    return resultado


# ============================================================
# 🟨 4. AGREGAR UN PRODUCTO A UNA TIENDA (TiendaProducto)
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

    # 🔍 Buscar si ya existe un registro con esa tienda + URL
    existente = (
        db.query(models.TiendaProducto)
        .filter(
            models.TiendaProducto.tienda_id == datos.tienda_id,
            models.TiendaProducto.url_producto == datos.url_producto
        )
        .first()
    )

    if existente:
        return {
            "message": "TiendaProducto ya existía, se reutiliza.",
            "tienda_producto": existente
        }

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
# 🟥 5. AGREGAR OFERTA DE PRECIO (OfertaActual)
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

    oferta_existente = db.query(models.OfertaActual).filter(
        models.OfertaActual.tienda_producto_id == datos.tienda_producto_id
    ).first()

    ahora = datetime.utcnow()


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

    nueva = models.OfertaActual(
        tienda_producto_id=tp.id,
        producto_id=tp.producto_id,
        tienda_id=tp.tienda_id,
        precio_centavos=datos.precio_centavos,
        disponibilidad=datos.disponibilidad,
        moneda=datos.moneda,
        fecha_listado=ahora,
        fecha_scraping=ahora
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "message": "Oferta creada correctamente",
        "oferta": nueva
    }


# ============================================================
# 🟦 6. EDITAR TIENDA
# ============================================================
@router.put("/{tienda_id}", summary="Editar tienda")
def editar_tienda(tienda_id: str, datos: schemas.TiendaCrear, db: Session = Depends(get_db)):

    tienda = db.query(models.Tienda).filter(models.Tienda.id == tienda_id).first()
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    tienda.nombre = datos.nombre
    tienda.sitio_web = datos.sitio_web
    tienda.url = datos.url

    db.commit()
    db.refresh(tienda)

    return {
        "message": "Tienda actualizada",
        "tienda": tienda
    }


# ============================================================
# 🟦 7. EDITAR URL DE TIENDA_PRODUCTO
# ============================================================
@router.put("/editar-producto/{tienda_producto_id}", summary="Editar URL de tienda-producto")
def editar_tienda_producto(
    tienda_producto_id: UUID,
    datos: schemas.TiendaProductoEditar,
    db: Session = Depends(get_db)
):
    tp = db.query(models.TiendaProducto).filter(
        models.TiendaProducto.id == tienda_producto_id
    ).first()

    if not tp:
        raise HTTPException(status_code=404, detail="Relación tienda-producto no encontrada")

    tp.url_producto = datos.url_producto
    tp.actualizado_en = datetime.utcnow()

    db.commit()
    db.refresh(tp)

    return {"message": "TiendaProducto actualizado"}


# ============================================================
# 🟥 8. ELIMINAR TIENDA_PRODUCTO
# ============================================================
@router.delete("/eliminar-producto/{tienda_producto_id}", summary="Eliminar tienda de producto")
def eliminar_tienda_producto(
    tienda_producto_id: UUID,
    db: Session = Depends(get_db)
):
    tp = db.query(models.TiendaProducto).filter(
        models.TiendaProducto.id == tienda_producto_id
    ).first()

    if not tp:
        raise HTTPException(status_code=404, detail="Relación tienda-producto no encontrada")

    db.delete(tp)
    db.commit()

    return {"message": "Relación tienda-producto eliminada correctamente"}


# ============================================================
# 🟥 9. ELIMINAR TIENDA
# ============================================================
@router.delete("/{tienda_id}", summary="Eliminar tienda")
def eliminar_tienda(tienda_id: str, db: Session = Depends(get_db)):

    tienda = db.query(models.Tienda).filter(models.Tienda.id == tienda_id).first()
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    db.delete(tienda)
    db.commit()

    return {"message": "Tienda eliminada correctamente"}


@router.get("/ofertas/producto/{producto_id}", summary="Listar ofertas de un producto")
def listar_ofertas_producto(producto_id: UUID, db: Session = Depends(get_db)):

    filas = (
        db.query(models.OfertaActual, models.Tienda.nombre, models.TiendaProducto.url_producto)
        .join(models.TiendaProducto, models.TiendaProducto.id == models.OfertaActual.tienda_producto_id)
        .join(models.Tienda, models.Tienda.id == models.OfertaActual.tienda_id)
        .filter(models.OfertaActual.producto_id == producto_id)
        .all()
    )

    resultado = []
    for oferta, tienda_nombre, url_producto in filas:
        resultado.append({
            "id": oferta.id,
            "tienda_producto_id": oferta.tienda_producto_id,
            "tienda_nombre": tienda_nombre,
            "url_producto": url_producto,
            "precio_centavos": oferta.precio_centavos,
            "moneda": oferta.moneda,
            "disponibilidad": oferta.disponibilidad,
            "fecha_listado": oferta.fecha_listado,
            "fecha_scraping": oferta.fecha_scraping
        })

    return resultado


@router.put("/ofertas/{oferta_id}", summary="Editar oferta")
def editar_oferta(oferta_id: UUID, datos: schemas.OfertaCrear, db: Session = Depends(get_db)):

    oferta = db.query(models.OfertaActual).filter(models.OfertaActual.id == oferta_id).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")

    oferta.precio_centavos = datos.precio_centavos
    oferta.disponibilidad = datos.disponibilidad
    oferta.moneda = datos.moneda
    oferta.fecha_scraping = datetime.utcnow()

    db.commit()
    db.refresh(oferta)

    return {"message": "Oferta actualizada", "oferta": oferta}

@router.delete("/ofertas/{oferta_id}", summary="Eliminar oferta")
def eliminar_oferta(oferta_id: UUID, db: Session = Depends(get_db)):

    oferta = db.query(models.OfertaActual).filter(models.OfertaActual.id == oferta_id).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")

    db.delete(oferta)
    db.commit()

    return {"message": "Oferta eliminada correctamente"}