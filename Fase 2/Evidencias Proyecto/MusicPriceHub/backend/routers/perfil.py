# routers/perfil.py
from fastapi import APIRouter, Depends, HTTPException, status, Header
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
# Obtener usuario desde token
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
# 1️⃣ OBTENER PERFIL
# -------------------------
@router.get("/me")
def obtener_perfil(Authorization: str = Header(None), db: Session = Depends(get_db)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Falta Authorization")

    token = Authorization.replace("Bearer ", "")
    usuario = obtener_usuario_actual(token, db)

    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario.id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    return {
    "correo": usuario.correo,
    "nombre_publico": perfil.nombre_publico,
    "region": perfil.region,
    "comuna": perfil.comuna,
    "avatar_url": perfil.avatar_url,
}

# -------------------------
# 2️⃣ ACTUALIZAR PERFIL
# -------------------------
# 2️⃣ Actualizar datos del perfil
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

    # ==============================
    # 🔥 NUEVOS CAMPOS
    # ==============================
    perfil.nombre_publico = datos.get("nombre_publico", perfil.nombre_publico)
    perfil.region = datos.get("region", perfil.region)
    perfil.comuna = datos.get("comuna", perfil.comuna)
    perfil.avatar_url = datos.get("avatar_url", perfil.avatar_url)

    db.commit()
    db.refresh(perfil)

    return {
        "message": "Perfil actualizado correctamente",
        "perfil": {
            "nombre_publico": perfil.nombre_publico,
            "region": perfil.region,
            "comuna": perfil.comuna,
            "avatar_url": perfil.avatar_url
        }
    }
# -------------------------
# 3️⃣ CAMBIAR CONTRASEÑA
# -------------------------
@router.put("/cambiar_contrasena")
def cambiar_contrasena(
    datos: dict,
    Authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Falta Authorization")

    token = Authorization.replace("Bearer ", "")
    usuario = obtener_usuario_actual(token, db)

    contrasena_actual = datos.get("contrasena_actual")
    contrasena_nueva = datos.get("contrasena_nueva")

    if not contrasena_actual or not contrasena_nueva:
        raise HTTPException(status_code=400, detail="Faltan campos")

    if not verify_password(contrasena_actual, usuario.contrasena_hash):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    usuario.contrasena_hash = get_password_hash(contrasena_nueva)
    db.commit()

    return {"message": "Contraseña actualizada correctamente"}
