# scraper/services/catalogo_service.py
import uuid
from datetime import datetime
from models import Producto, OfertaActual, HistorialPrecio, Tienda, TiendaProducto


def precio_a_centavos(precio_str: str):
    """
    Convierte "$3.399.990" → 3399990 (int)
    """
    if not precio_str:
        return None

    limpio = (
        precio_str.replace("$", "")
        .replace(".", "")
        .replace(" ", "")
        .replace(",", "")
        .strip()
    )

    try:
        return int(limpio)
    except:
        return None


def sync_producto_desde_scraping(db, tienda: Tienda, datos: dict):
    """
    1. Crear o actualizar producto
    2. Registrar tienda-producto (si no existe)
    3. Registrar oferta actual
    4. Registrar historial de precios
    """

    nombre = datos.get("nombre")

    if not nombre:
        print("❌ ERROR: El scraping NO contiene nombre de producto.")
        return None

    # -----------------------------
    # 1) Buscar o crear producto
    # -----------------------------
    producto = db.query(Producto).filter(Producto.nombre.ilike(nombre)).first()

    if not producto:
        producto = Producto(
            id=uuid.uuid4(),
            nombre=nombre,
            marca="Fender",
            modelo="AutoDetect",
        )
        db.add(producto)
        db.flush()
        print(f"🟢 Producto creado: {producto.id}")

    # -----------------------------
    # 2) Buscar o crear tienda-producto
    # -----------------------------
    tienda_producto = (
        db.query(TiendaProducto)
        .filter(
            TiendaProducto.tienda_id == tienda.id,
            TiendaProducto.url_producto == datos["url"]
        )
        .first()
    )

    if not tienda_producto:
        tienda_producto = TiendaProducto(
            id=uuid.uuid4(),
            tienda_id=tienda.id,
            producto_id=producto.id,
            url_producto=datos["url"],
            sku_tienda="AUTO",
            activo=True
        )
        db.add(tienda_producto)
        db.flush()

       # -----------------------------
    # 3) Registrar oferta actual
    #    (una por tienda_producto)
    # -----------------------------
    precio_centavos = precio_a_centavos(datos.get("precio"))

    # ¿Ya existe oferta actual para este tienda_producto?
    oferta = (
        db.query(OfertaActual)
        .filter(OfertaActual.tienda_producto_id == tienda_producto.id)
        .first()
    )

    if oferta:
        # 🔁 Actualizar oferta existente
        oferta.precio_centavos = precio_centavos
        oferta.moneda = "CLP"
        oferta.disponibilidad = "disponible"
        oferta.fecha_listado = datetime.utcnow()
        oferta.fecha_scraping = datetime.utcnow()
    else:
        # 🆕 Crear nueva oferta
        oferta = OfertaActual(
            id=uuid.uuid4(),
            tienda_producto_id=tienda_producto.id,
            producto_id=producto.id,
            tienda_id=tienda.id,
            precio_centavos=precio_centavos,
            moneda="CLP",
            disponibilidad="disponible",
            fecha_listado=datetime.utcnow(),
            fecha_scraping=datetime.utcnow(),
        )
        db.add(oferta)


    # -----------------------------
    # 4) Registrar historial
    # -----------------------------
    historial = HistorialPrecio(
        id=uuid.uuid4(),
        tienda_producto_id=tienda_producto.id,
        precio_centavos=precio_centavos,
        moneda="CLP",
        disponibilidad="disponible",
        valido_desde=datetime.utcnow(),
        fuente="scraper",
        fecha_scraping=datetime.utcnow()
    )
    db.add(historial)

    print(f"💰 Precio registrado: {datos.get('precio')} ({precio_centavos} centavos)")

    return producto
