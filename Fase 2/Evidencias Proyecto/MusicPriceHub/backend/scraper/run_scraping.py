import uuid
from datetime import datetime

from scraper.tiendas.fender_scraper import FenderScraper
from database import SessionLocal
from models import Tienda, TareaScraping, ResultadoScraping


URL_PRUEBA = "https://www.fender.cl/fender-telecasterr-luxe-american-ultra-3697.html"


def guardar_scraping_en_bd(datos_scraping: dict):
    """
    Guarda el resultado del scraping en operaciones.tareas_scraping
    y operaciones.resultados_scraping.
    """
    db = SessionLocal()

    try:
        # 1) Buscar (o crear) la tienda Fender
        tienda = (
            db.query(Tienda)
            .filter(Tienda.nombre.ilike("%Fender%"))
            .first()
        )

        if not tienda:
            # Ajusta los campos según tu modelo real de Tienda
            tienda = Tienda(
                id=uuid.uuid4(),
                nombre="Fender Chile",
                sitio_web="https://www.fender.cl",
                url="https://www.fender.cl",
            )
            db.add(tienda)
            db.flush()  # para tener tienda.id disponible

        # 2) Crear la tarea de scraping
        tarea = TareaScraping(
            id=uuid.uuid4(),
            tienda_id=tienda.id,
            inicio_en=datetime.utcnow(),
            estado="ejecutando",
            detalle="Scraping manual de un producto de prueba",
        )
        db.add(tarea)
        db.flush()  # obtenemos tarea.id

        # 3) Crear el resultado
        resultado = ResultadoScraping(
            id=uuid.uuid4(),
            tarea_id=tarea.id,
            url_producto=datos_scraping.get("url"),
            datos_extraidos=datos_scraping,  # dict -> jsonb
            obtenido_en=datetime.utcnow(),
            estado="ok",
        )
        db.add(resultado)

        # 4) Marcar fin de la tarea
        tarea.fin_en = datetime.utcnow()
        tarea.estado = "ok"

        # 5) Commit final
        db.commit()

        print("✅ Scraping guardado en BD")
        print("   - Tarea ID     :", tarea.id)
        print("   - Resultado ID :", resultado.id)

    except Exception as e:
        db.rollback()
        print("❌ Error guardando en BD:", e)
        # opcional: podrías actualizar tarea.estado = "error" si ya estaba creada
    finally:
        db.close()


def test():
    scraper = FenderScraper(tienda="fender")
    datos = scraper.parse_producto(URL_PRUEBA)
    print("Resultado del scraping:")
    print(datos)

    # Guardar en la base de datos
    guardar_scraping_en_bd(datos)


if __name__ == "__main__":
    test()
