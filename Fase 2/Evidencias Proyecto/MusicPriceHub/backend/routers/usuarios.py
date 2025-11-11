from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    return db.execute("SELECT id, nombre, email FROM autenticacion.usuarios;").fetchall()