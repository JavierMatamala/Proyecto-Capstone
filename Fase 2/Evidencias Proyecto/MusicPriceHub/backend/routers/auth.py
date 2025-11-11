# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario,Perfil
from utils.seguridad import get_password_hash
from schemas import UsuarioCrear, UsuarioMostrar  # 👈 import directo desde schemas.py

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# Dependencia para obtener sesión DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------ REGISTRO DE USUARIO ------------------
@router.post("/registro", response_model=UsuarioMostrar, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: UsuarioCrear, db: Session = Depends(get_db)):
    # Verificar si ya existe el correo
    existe = db.query(Usuario).filter(Usuario.correo == datos.correo).first()
    if existe:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # Hashear la contraseña
    try:
        hash_pw = get_password_hash(datos.contraseña)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al hashear contraseña: {str(e)}")

    # Crear usuario base
    usuario = Usuario(
        correo=datos.correo,
        contrasena_hash=hash_pw,
        es_admin=False
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
  # Crear perfil asociado automáticamente
    perfil = Perfil(
        usuario_id=usuario.id,
        nombre_publico=datos.nombre,
        pais=None,
        ciudad=None,
        avatar_url=None
    )
    db.add(perfil)
    db.commit()
    db.refresh(perfil)

    # Asociar perfil al objeto usuario para el retorno
    usuario.perfil = perfil
    # ✅ Conversión explícita al esquema Pydantic
    return UsuarioMostrar.from_orm(usuario)


