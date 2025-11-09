from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://administrador:mQUcaMhDm9jQsxWMbYsHi3oCSulusarH@dpg-d479nfchg0os73fhha4g-a.virginia-postgres.render.com/comparador_49rl"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print("✅ Conexión exitosa a Render:")
        print(result.fetchone())
except Exception as e:
    print("❌ Error:", e)
