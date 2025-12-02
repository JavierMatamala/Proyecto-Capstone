from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models, schemas
from datetime import datetime
import uuid
from utils.seguridad import get_current_user
router = APIRouter(prefix="/api/productos", tags=["Productos"])

# ======================================
# 🔐 DEPENDENCIA LOCAL PARA LEER TOKEN
# (NO toca auth.py)
# ======================================
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from utils.seguridad import SECRET_KEY, ALGORITHM
from models import Usuario

token_auth = HTTPBearer()

def get_current_user_local(
    credentials=Depends(token_auth),
    db=Depends(lambda: SessionLocal())
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")

        usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        return usuario

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")


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

    precios = []
    for oferta, tienda, tienda_prod in ofertas:
        precios.append({
            "tienda": tienda.nombre,
            "url_producto": tienda_prod.url_producto,
            "precio": oferta.precio_centavos,
            "moneda": oferta.moneda,
            "disponibilidad": oferta.disponibilidad,
        })

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
        imagen_url=prod.imagen_url,
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

    producto.nombre = prod.get("nombre", producto.nombre)
    producto.marca = prod.get("marca", producto.marca)
    producto.modelo = prod.get("modelo", producto.modelo)
    producto.descripcion = prod.get("descripcion", producto.descripcion)
    producto.especificaciones = prod.get("especificaciones", producto.especificaciones)
    producto.categoria_id = prod.get("categoria_id", producto.categoria_id)
    producto.precio_base_centavos = prod.get("precio_base_centavos", producto.precio_base_centavos)

    if "imagen_url" in prod:
        producto.imagen_url = prod["imagen_url"]

    if "url_fuente" in prod:
        producto.url_fuente = prod["url_fuente"]

    historial = models.HistorialPrecio(
        id=uuid.uuid4(),
        tienda_producto_id=producto.id,
        precio_centavos=prod.get("precio_base_centavos", producto.precio_base_centavos),
        disponibilidad="disponible",
        valido_desde=datetime.utcnow(),
        fuente="",
        fecha_scraping=datetime.utcnow()
    )
    db.add(historial)
    db.commit()
    db.refresh(historial)
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

# ============================================================
# HISTORIAL DE PRECIOS POR PRODUCTO
# ============================================================
@router.get("/{producto_id}/historial")
def historial_precios_producto(producto_id: str, db: Session = Depends(get_db)):

    registros = (
        db.query(models.HistorialPrecio, models.Tienda.nombre)
        .join(
            models.TiendaProducto,
            models.HistorialPrecio.tienda_producto_id == models.TiendaProducto.id,
        )
        .join(
            models.Tienda,
            models.TiendaProducto.tienda_id == models.Tienda.id,
        )
        .filter(models.TiendaProducto.producto_id == producto_id)
        .order_by(models.HistorialPrecio.fecha_scraping.asc())
        .all()
    )
    historial = []
    for h, nombre_tienda in registros:
        fecha = h.fecha_scraping or h.valido_desde

        historial.append(
            {
                "fecha": fecha.isoformat() if fecha else None,
                "tienda": nombre_tienda,
                "precio": h.precio_centavos if h.precio_centavos else 0,
                "moneda": h.moneda,
            }
        )
    return {
        "producto_id": producto_id,
        "historial": historial,
    }

# ---------------------------------------------------------
# CREAR ALERTA DE PRECIO (AHORA FUNCIONAL)
# ---------------------------------------------------------
@router.post("/{producto_id}/alertas/crear")
def crear_alerta_precio(
    producto_id: str,
    payload: schemas.AlertaCrear,
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    
    # Verificar si ya existe alerta activa para este producto
    existe = db.query(models.AlertaPrecio).filter(
        models.AlertaPrecio.usuario_id == usuario.id,
        models.AlertaPrecio.producto_id == producto_id,
        models.AlertaPrecio.activa == True
    ).first()

    if existe:
        raise HTTPException(status_code=400, detail="Ya tienes una alerta activa para este producto")

    alerta = models.AlertaPrecio(
        id=uuid.uuid4(),
        usuario_id=usuario.id,
        producto_id=producto_id,
        precio_objetivo=payload.precio_objetivo,
        moneda="CLP",
        activa=True,
        creada_en=datetime.utcnow()
    )

    db.add(alerta)
    db.commit()
    db.refresh(alerta)

    return {"message": "Alerta creada", "alerta": alerta}


@router.get("/alertas/mis-alertas")
def mis_alertas(
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    alertas = db.query(models.AlertaPrecio).filter(
        models.AlertaPrecio.usuario_id == usuario.id
    ).order_by(models.AlertaPrecio.creada_en.desc()).all()

    return {"alertas": alertas}

@router.get("/alertas/mis-alertas-detalladas")
def mis_alertas_detalladas(
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    alertas = db.query(models.AlertaPrecio).filter(
        models.AlertaPrecio.usuario_id == usuario.id
    ).order_by(models.AlertaPrecio.creada_en.desc()).all()

    resultado = []

    for a in alertas:
        # Obtener producto
        prod = db.query(models.Producto).filter(models.Producto.id == a.producto_id).first()

        resultado.append({
            "id": a.id,
            "producto_id": a.producto_id,
            "producto_nombre": prod.nombre if prod else "Producto eliminado",
            "precio_objetivo": a.precio_objetivo,
            "moneda": a.moneda,
            "activa": a.activa,
            "cumplida": a.cumplida if hasattr(a, "cumplida") else False,
            "creada_en": a.creada_en
        })

    return {"alertas": resultado}