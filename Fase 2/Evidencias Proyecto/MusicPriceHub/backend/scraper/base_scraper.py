# scraper/base_scraper.py
from playwright.sync_api import sync_playwright
from sqlalchemy.orm import Session
from datetime import datetime

from models import TareaScraping, ResultadoScraping, Tienda
from scraper.services.catalogo_service import sync_producto_desde_scraping


class BaseScraper:
    def __init__(self, tienda: Tienda, db: Session):
        self.tienda = tienda
        self.db = db

    def get_page_html(self, url: str) -> str:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_timeout(1500)
            html = page.content()
            browser.close()
            return html

    def parse_producto(self, url: str) -> dict:
        raise NotImplementedError("parse_producto() debe ser implementado por el scraper hijo.")

    def guardar_en_bd(self, datos_scraping: dict):
        ahora = datetime.utcnow()
        tarea = None

        try:
            # 1) Registrar tarea de scraping
            tarea = TareaScraping(
                tienda_id=self.tienda.id,
                inicio_en=ahora,
                estado="pendiente",
                detalle=f"Scraping de producto {datos_scraping.get('url')}",
            )
            self.db.add(tarea)
            self.db.flush()

            # 2) Crear / actualizar producto + oferta + historial
            producto = sync_producto_desde_scraping(
                db=self.db,
                tienda=self.tienda,
                datos=datos_scraping,
            )

            # 3) Registrar resultado del scraping
            resultado = ResultadoScraping(
                tarea_id=tarea.id,
                url_producto=datos_scraping.get("url"),
                datos_extraidos=datos_scraping,
                obtenido_en=ahora,
                estado="ok",
            )
            self.db.add(resultado)

            # 4) Finalizar tarea
            tarea.estado = "ok"
            tarea.fin_en = datetime.utcnow()

            self.db.commit()
            return producto

        except Exception as e:
            self.db.rollback()
            if tarea:
                tarea.estado = "error"
                tarea.detalle = f"Error: {str(e)}"
                tarea.fin_en = datetime.utcnow()
                self.db.commit()
            print("ERROR al guardar en BD:", str(e))
            return None

    def run(self, url: str):
        print(f"Scrapeando: {url}")

        datos = self.parse_producto(url)

        if not datos:
            print("❌ Error: el scraper no devolvió datos.")
            return None

        return self.guardar_en_bd(datos)
