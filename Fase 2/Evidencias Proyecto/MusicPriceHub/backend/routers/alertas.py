from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models, schemas
from uuid import UUID

router = APIRouter(
    prefix="/api/alertas",
    tags=["Alertas"]
)

# ============================
# 🔹 LISTAR TODAS LAS ALERTAS
# ============================
@router.get("/", response_model=list[schemas.AlertaBase])
def listar_alertas(db: Session = Depends(get_db)):
    alertas = (
        db.query(models.AlertaPrecio)
        .options(
            joinedload(models.AlertaPrecio.producto),
            joinedload(models.AlertaPrecio.usuario)
        )
        .all()
    )
    return alertas


# ============================
# 🔹 CREAR UNA NUEVA ALERTA
# ============================
@router.post("/", response_model=schemas.AlertaBase, status_code=status.HTTP_201_CREATED)
def crear_alerta(alerta: schemas.AlertaCrear, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == alerta.producto_id).first()
    usuario = db.query(models.Usuario).filter(models.Usuario.id == alerta.usuario_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    nueva_alerta = models.AlertaPrecio(
        producto_id=alerta.producto_id,
        usuario_id=alerta.usuario_id,
        precio_objetivo=alerta.precio_objetivo
    )
    db.add(nueva_alerta)
    db.commit()
    db.refresh(nueva_alerta)
    return nueva_alerta


# ============================
# 🔹 OBTENER ALERTA POR ID
# ============================
@router.get("/{alerta_id}", response_model=schemas.AlertaBase)
def obtener_alerta(alerta_id: UUID, db: Session = Depends(get_db)):
    alerta = (
        db.query(models.AlertaPrecio)
        .options(
            joinedload(models.AlertaPrecio.producto),
            joinedload(models.AlertaPrecio.usuario)
        )
        .filter(models.AlertaPrecio.id == alerta_id)
        .first()
    )
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada.")
    return alerta


# ============================
# 🔹 ELIMINAR ALERTA
# ============================
@router.delete("/{alerta_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_alerta(alerta_id: UUID, db: Session = Depends(get_db)):
    alerta = db.query(models.AlertaPrecio).filter(models.AlertaPrecio.id == alerta_id).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada.")

    db.delete(alerta)
    db.commit()
    return {"mensaje": "Alerta eliminada correctamente."}