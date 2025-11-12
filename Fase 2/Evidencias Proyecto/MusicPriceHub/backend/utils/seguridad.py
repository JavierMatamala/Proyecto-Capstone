# utils/seguridad.py
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

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
