from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/api/productos", tags=["Productos"])

# DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================================
# GET GENERAL → Lista productos + precio_final
# ==========================================================
@router.get("/", response_model=list[schemas.ProductoMostrar])
def listar_productos_con_ofertas(db: Session = Depends(get_db)):
    productos = (
        db.query(models.Producto)
        .options(joinedload(models.Producto.ofertas))
        .all()
    )
    
    respuesta = []
    for p in productos:

        # PRECIO SEGÚN OFERTAS
        precio_oferta = (
            min(o.precio_centavos for o in p.ofertas)
            if p.ofertas else None
        )

        # PRECIO FINAL
        if p.precio_base_centavos is not None and precio_oferta is not None:
            precio_final = min(p.precio_base_centavos, precio_oferta)
        elif p.precio_base_centavos is not None:
            precio_final = p.precio_base_centavos
        else:
            precio_final = precio_oferta

        respuesta.append({
            "id": p.id,
            "nombre": p.nombre,
            "marca": p.marca,
            "modelo": p.modelo,
            "descripcion": p.descripcion,
            "imagen_url": p.imagen_url,
            "url_fuente": p.url_fuente,
            "especificaciones": p.especificaciones,
            "precio_base_centavos": p.precio_base_centavos,
            "precio_final": precio_final,      # 👈 ESTA LÍNEA FALTABA
            "ofertas": p.ofertas
        })

    return respuesta

# ==========================================================
# GET DETALLE → Información completa del producto
# ==========================================================
@router.get("/{producto_id}/detalle-frontend")
def detalle_frontend(producto_id: str, db: Session = Depends(get_db)):

    # Obtener producto + ofertas + tienda_producto + tienda
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    ofertas = (
        db.query(models.OfertaActual, models.Tienda, models.TiendaProducto)
        .join(models.Tienda, models.OfertaActual.tienda_id == models.Tienda.id)
        .join(
            models.TiendaProducto,
            models.OfertaActual.tienda_producto_id == models.TiendaProducto.id
        )
        .filter(models.OfertaActual.producto_id == producto_id)
        .all()
    )

    # Estructurar datos
    precios = []
    for oferta, tienda, tienda_prod in ofertas:
        precios.append({
            "tienda": tienda.nombre,
            "url_producto": tienda_prod.url_producto,
            "precio": oferta.precio_centavos,
            "moneda": oferta.moneda,
            "disponibilidad": oferta.disponibilidad,
        })

    # Ordenar por precio más bajo
    precios_ordenados = sorted(precios, key=lambda x: x["precio"])

    return {
        "producto": {
            "id": producto.id,
            "nombre": producto.nombre,
            "marca": producto.marca,
            "modelo": producto.modelo,
            "descripcion": producto.descripcion,
            "especificaciones": producto.especificaciones,
            "precio_base_centavos": producto.precio_base_centavos,
            "imagen_url": producto.imagen_url,
            "url_fuente": producto.url_fuente,
        },
        "precios": precios_ordenados
    }

# ==========================================================
# POST → Crear producto
# ==========================================================
@router.post("/", response_model=schemas.ProductoMostrar)
def crear_producto(prod: schemas.ProductoCrear, db: Session = Depends(get_db)):

    nuevo = models.Producto(
        nombre=prod.nombre,
        marca=prod.marca,
        modelo=prod.modelo,
        descripcion=prod.descripcion,
        imagen_url=prod.imagen_url,   # ← ahora sí existe
        url_fuente=prod.url_fuente,
        especificaciones=prod.especificaciones,
        categoria_id=prod.categoria_id,
        precio_base_centavos=prod.precio_base_centavos
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


# ==========================================================
# PUT → Actualizar producto
# ==========================================================
@router.put("/{producto_id}", response_model=schemas.ProductoMostrar)
def actualizar_producto(producto_id: str, prod: dict, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # 🔥 Actualización segura de todos los campos
    producto.nombre = prod.get("nombre", producto.nombre)
    producto.marca = prod.get("marca", producto.marca)
    producto.modelo = prod.get("modelo", producto.modelo)
    producto.descripcion = prod.get("descripcion", producto.descripcion)
    producto.especificaciones = prod.get("especificaciones", producto.especificaciones)
    producto.categoria_id = prod.get("categoria_id", producto.categoria_id)
    producto.precio_base_centavos = prod.get("precio_base_centavos", producto.precio_base_centavos)

    # 🔥 IMPORTANTE: imagen_url debe actualizarse si viene en el payload
    if "imagen_url" in prod:
        producto.imagen_url = prod["imagen_url"]

    # 🔥 También se puede actualizar url_fuente si la usas
    if "url_fuente" in prod:
        producto.url_fuente = prod["url_fuente"]

    db.commit()
    db.refresh(producto)
    return producto


# ==========================================================
# DELETE
# ==========================================================
@router.delete("/{producto_id}")
def eliminar_producto(producto_id: str, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(404, "Producto no existe")

    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado"}

@router.get("/{producto_id}", response_model=schemas.ProductoMostrar)
def obtener_producto(producto_id: str, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto
