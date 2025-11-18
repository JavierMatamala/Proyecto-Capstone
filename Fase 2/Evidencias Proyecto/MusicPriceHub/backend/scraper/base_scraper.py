from playwright.sync_api import sync_playwright

class BaseScraper:
    def __init__(self, tienda):
        self.tienda = tienda

    def get_page_html(self, url: str) -> str:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # MUCHÍSIMO más compatible con tiendas VTEX
            page.goto(url, wait_until="domcontentloaded")

            # Pequeña espera opcional (soluciona problemas en Windows)
            page.wait_for_timeout(1500)

            html = page.content()
            browser.close()
            return html