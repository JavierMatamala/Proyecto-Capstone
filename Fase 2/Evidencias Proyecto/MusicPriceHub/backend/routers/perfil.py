# routers/perfil.py
from fastapi import APIRouter, Depends, HTTPException, status,Header
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario, Perfil
from utils.seguridad import get_password_hash, verify_password
from jose import jwt, JWTError

SECRET_KEY = "admin"
ALGORITHM = "HS256"

router = APIRouter(prefix="/perfil", tags=["Perfil"])

# -------------------------
# Dependencia para la DB
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# Función auxiliar para obtener usuario autenticado desde el token
# -------------------------
def obtener_usuario_actual(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

# -------------------------
# 1️⃣ Obtener perfil del usuario actual
# -------------------------

@router.get("/me")
def obtener_perfil(Authorization: str = Header(None), db: Session = Depends(get_db)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Falta el header Authorization")

    token = Authorization.replace("Bearer ", "")
    usuario = obtener_usuario_actual(token, db)
    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario.id).first()

    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    return {
        "correo": usuario.correo,
        "nombre_publico": perfil.nombre_publico,
        "pais": perfil.pais,
        "ciudad": perfil.ciudad,
    }
# 2️⃣ Actualizar datos del perfil
# -------------------------
@router.put("/actualizar")
def actualizar_perfil(
    datos: dict,
    Authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Falta el header Authorization")

    token = Authorization.replace("Bearer ", "")
    usuario = obtener_usuario_actual(token, db)

    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario.id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    # Actualizar campos (solo si vienen en el body)
    perfil.nombre_publico = datos.get("nombre_publico", perfil.nombre_publico)
    perfil.pais = datos.get("pais", perfil.pais)
    perfil.ciudad = datos.get("ciudad", perfil.ciudad)

    db.commit()
    db.refresh(perfil)

    return {
        "message": "Perfil actualizado correctamente",
        "perfil": {
            "nombre_publico": perfil.nombre_publico,
            "pais": perfil.pais,
            "ciudad": perfil.ciudad
        }
    }
# -------------------------
# 3️⃣ Cambiar contraseña
# -------------------------
@router.put("/cambiar_contrasena")
def cambiar_contrasena(
    datos: dict,
    Authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Falta el header Authorization")

    token = Authorization.replace("Bearer ", "")
    usuario = obtener_usuario_actual(token, db)

    # Obtener campos desde el body
    contrasena_actual = datos.get("contrasena_actual")
    contrasena_nueva = datos.get("contrasena_nueva")

    if not contrasena_actual or not contrasena_nueva:
        raise HTTPException(status_code=400, detail="Debes ingresar ambas contraseñas")

    # Verificar que la contraseña actual sea correcta
    if not verify_password(contrasena_actual, usuario.contrasena_hash):
        raise HTTPException(status_code=401, detail="La contraseña actual es incorrecta")

    # Generar nuevo hash y actualizar
    usuario.contrasena_hash = get_password_hash(contrasena_nueva)
    db.commit()

    return {"message": "Contraseña actualizada correctamente"}
