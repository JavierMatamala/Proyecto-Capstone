# scraper/run_scraping.py
from database import SessionLocal
from models import Tienda
from scraper.tiendas.fender_scraper import FenderScraper

URL_PRUEBA = "https://www.fender.cl/fender-telecasterr-luxe-american-ultra-3697.html"


def test():
    db = SessionLocal()
    try:
        # 1) Buscar o crear tienda Fender
        tienda = db.query(Tienda).filter(Tienda.nombre.ilike("%Fender%")).first()
        if not tienda:
            tienda = Tienda(
                nombre="Fender Chile",
                sitio_web="https://www.fender.cl",
                url="https://www.fender.cl",
            )
            db.add(tienda)
            db.flush()

        # 2) Instanciar scraper con tienda + db
        scraper = FenderScraper(tienda=tienda, db=db)

        # 3) Ejecutar pipeline completo
        producto = scraper.run(URL_PRUEBA)

        if producto:
            print("✅ Producto sincronizado:", producto.id)
        else:
            print("❌ No se pudo sincronizar el producto")

    finally:
        db.close()


if __name__ == "__main__":
    test()
