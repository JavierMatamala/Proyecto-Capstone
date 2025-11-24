# backend/scraper/worker.py
import time
from scraper.run_scraping_scheduled import scrapear_productos_fender

# Para probar: 60 segundos.
# Luego puedes subirlo a 3600 (1 hora) o 36000 (10 horas).
INTERVALO = 60  

def main():
    while True:
        print("🚀 Ejecutando scraping automático (worker Docker)...")
        try:
            scrapear_productos_fender()
        except Exception as e:
            print("❌ Error en el scraping:", e)

        print(f"⏳ Esperando {INTERVALO} segundos...")
        time.sleep(INTERVALO)


if __name__ == "__main__":
    main()
