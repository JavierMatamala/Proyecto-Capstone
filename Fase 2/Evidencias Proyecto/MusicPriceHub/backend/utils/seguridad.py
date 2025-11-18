# utils/seguridad.py
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from database import get_db
from sqlalchemy.orm import Session
from models import Usuario

# ===============================
# CONFIGURACIÓN TOKEN JWT
# ===============================
SECRET_KEY = "admin"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ===============================
# CONFIGURACIÓN HASH 
# ===============================
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception as e:
        raise ValueError(f"Error al hashear contraseña: {str(e)}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ===============================
# GENERACIÓN DE TOKEN JWT
# ===============================
def crear_token_acceso(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Ruta donde el frontend enviará el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Nuevo: oauth opcional (no exige token)
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token no contiene usuario válido.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return usuario_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Autenticación normal (obligatoria)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:

    usuario_id = decode_token(token)

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return usuario


# ===============================
# NUEVO — Autenticación opcional
# ===============================
def get_current_user_optional(
    token: str = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
):
    """
    Devuelve:
      - Usuario válido si se envió token
      - None si no hay token o si es inválido
    SIN lanzar excepción 401.
    """
    if not token:
        return None

    try:
        usuario_id = decode_token(token)
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        return usuario
    except Exception:
        return None