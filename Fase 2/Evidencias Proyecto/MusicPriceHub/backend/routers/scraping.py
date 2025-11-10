from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Producto, Tienda, OfertaActual
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import uuid

router = APIRouter(prefix="/scraping", tags=["Scraping"])

# Dependencia para obtener una sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/guardar")
def scrape_y_guardar(url: str, db: Session = Depends(get_db)):
    """
    Scrapea datos de un producto y los guarda en la base de datos.
    Devuelve los datos insertados.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
        )
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "lxml")

    # 🔹 Extracción básica
    nombre = soup.select_one("h1, .product-title, .titulo")
    precio = soup.select_one(".price, .precio, .product-price")
    descripcion = soup.select_one(".descripcion, .product-description")
    tienda = soup.select_one(".store-name, .seller, .vendedor")

    nombre = nombre.get_text(strip=True) if nombre else "Producto desconocido"
    precio_texto = precio.get_text(strip=True) if precio else "0"
    descripcion = descripcion.get_text(strip=True) if descripcion else "Sin descripción"
    tienda_nombre = tienda.get_text(strip=True) if tienda else "Tienda desconocida"

    # 🔹 Limpieza del precio (para formato chileno)
    precio_limpio = (
        precio_texto.replace("$", "")
        .replace(".", "")
        .replace(",", ".")
        .strip()
    )

    try:
        precio_numerico = float(precio_limpio)
    except ValueError:
        precio_numerico = 0.0

    # 🔹 Verificar o crear tienda
    tienda_existente = db.query(Tienda).filter(Tienda.nombre == tienda_nombre).first()
    if not tienda_existente:
        tienda_nueva = Tienda(id=uuid.uuid4(), nombre=tienda_nombre or "Desconocida", url=url)
        db.add(tienda_nueva)
        db.commit()
        db.refresh(tienda_nueva)
        tienda_existente = tienda_nueva

    # 🔹 Verificar o crear producto
    producto_existente = db.query(Producto).filter(Producto.nombre == nombre).first()
    if not producto_existente:
        producto_nuevo = Producto(
            id=uuid.uuid4(),
            nombre=nombre,
            marca=None,
            modelo=None
        )
        db.add(producto_nuevo)
        db.commit()
        db.refresh(producto_nuevo)
        producto_existente = producto_nuevo

    # 🔹 Crear nueva oferta actual (modelo actualizado)
    nueva_oferta = OfertaActual(
        id=uuid.uuid4(),
        tienda_producto_id=uuid.uuid4(),  # genera automáticamente un identificador válido
        producto_id=producto_existente.id,
        tienda_id=tienda_existente.id,
        precio_centavos=int(precio_numerico),
        moneda="CLP",
        disponibilidad="Disponible",
        fecha_listado=datetime.now(),
        fecha_scraping=datetime.now(),
    )

    db.add(nueva_oferta)
    db.commit()
    db.refresh(nueva_oferta)

    # 🔹 Respuesta con datos útiles
    return {
        "producto": nombre,
        "descripcion": descripcion,
        "precio": precio_numerico,
        "tienda": tienda_nombre,
        "fecha_scraping": nueva_oferta.fecha_scraping.strftime("%Y-%m-%d %H:%M:%S"),
        "link": url
    }
