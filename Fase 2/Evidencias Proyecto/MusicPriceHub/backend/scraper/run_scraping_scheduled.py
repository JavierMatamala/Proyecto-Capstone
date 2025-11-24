# scraper/run_scraping_scheduled.py

from database import SessionLocal
from models import Tienda, TiendaProducto
from scraper.tiendas.fender_scraper import FenderScraper


def scrapear_productos_fender():
    db = SessionLocal()
    try:
        # 1) Buscar la tienda Fender
        tienda = (
            db.query(Tienda)
            .filter(Tienda.nombre.ilike("%Fender%"))
            .first()
        )

        if not tienda:
            print("❌ No se encontró la tienda Fender en la BD.")
            return

        # 2) Obtener todos los productos activos de esa tienda
        productos_tienda = (
            db.query(TiendaProducto)
            .filter(
                TiendaProducto.tienda_id == tienda.id,
                TiendaProducto.activo.is_(True),
            )
            .all()
        )

        if not productos_tienda:
            print("⚠️ No hay productos activos asociados a Fender.")
            return

        # 3) Instanciar scraper
        scraper = FenderScraper(tienda=tienda, db=db)

        # 4) Recorrer cada URL y ejecutar el pipeline
        for tp in productos_tienda:
            print("\n===============================")
            print(f"Scrapeando producto: {tp.url_producto}")
            print("===============================")
            scraper.run(tp.url_producto)

        print("\n✅ Scraping programado finalizado.")

    finally:
        db.close()


if __name__ == "__main__":
    scrapear_productos_fender()
