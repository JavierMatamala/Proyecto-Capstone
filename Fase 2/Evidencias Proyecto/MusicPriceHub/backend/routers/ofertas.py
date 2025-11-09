from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
import models

router = APIRouter(prefix="/api/ofertas", tags=["Ofertas"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def listar_ofertas(db: Session = Depends(get_db)):
    return db.execute("SELECT * FROM precios.ofertas_actuales;").fetchall()
