from bs4 import BeautifulSoup
from scraper.base_scraper import BaseScraper

class FenderScraper(BaseScraper):

    def parse_producto(self, url: str):
        html = self.get_page_html(url)
        soup = BeautifulSoup(html, "html.parser")

        # 1) NOMBRE
        nombre = None
        h1 = soup.select_one(".product-name h1")
        if h1:
            nombre = h1.text.strip()

        # 2) PRECIO
        precio = None
        price_tag = soup.select_one(".price-box .price")
        if price_tag:
            precio = price_tag.text.strip()

        # 3) IMAGEN
        imagen = None
        img_tag = soup.select_one(".product-image img")
        if img_tag:
            imagen = img_tag.get("src")

        # 4) DESCRIPCIÓN
        descripcion = None
        desc_tag = soup.select_one(".short-description .std")
        if desc_tag:
            descripcion = desc_tag.get_text(" ", strip=True)

        return {
            "nombre": nombre,
            "descripcion": descripcion,
            "precio": precio,
            "imagen": imagen,
            "url": url,
        }
