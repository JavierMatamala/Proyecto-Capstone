from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/api/productos", tags=["Productos"])

# Dependencia para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔹 GET: Listar todos los productos con sus ofertas
@router.get("/", response_model=list[schemas.ProductoMostrar])
def listar_productos_con_ofertas(db: Session = Depends(get_db)):
    productos = db.query(models.Producto).options(joinedload(models.Producto.ofertas)).all()
    return productos

# 🔹 GET: Obtener un producto específico con sus ofertas
@router.get("/{producto_id}", response_model=schemas.ProductoMostrar)
def obtener_producto(producto_id: str, db: Session = Depends(get_db)):
    producto = db.query(models.Producto)\
        .options(joinedload(models.Producto.ofertas))\
        .filter(models.Producto.id == producto_id)\
        .first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

# 🔹 POST: Crear nuevo producto
@router.post("/", response_model=schemas.ProductoMostrar)
def crear_producto(prod: schemas.ProductoCrear, db: Session = Depends(get_db)):
    nuevo = models.Producto(nombre=prod.nombre, marca=prod.marca, modelo=prod.modelo)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# 🔹 PUT: Actualizar producto
@router.put("/{producto_id}", response_model=schemas.ProductoMostrar)
def actualizar_producto(producto_id: str, prod: schemas.ProductoCrear, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto.nombre = prod.nombre
    producto.marca = prod.marca
    producto.modelo = prod.modelo
    db.commit()
    db.refresh(producto)
    return producto

# 🔹 DELETE: Eliminar producto
@router.delete("/{producto_id}")
def eliminar_producto(producto_id: str, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado correctamente"}
