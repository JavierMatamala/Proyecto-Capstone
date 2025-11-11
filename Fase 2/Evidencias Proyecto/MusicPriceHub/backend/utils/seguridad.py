from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# ===============================
# CONFIGURACIÓN TOKEN
# ===============================
SECRET_KEY = "admin"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ===============================
# CONFIGURACIÓN HASH (sin bcrypt)
# ===============================
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Genera el hash seguro de la contraseña usando sha256_crypt.
    """
    try:
        return pwd_context.hash(password)
    except Exception as e:
        raise ValueError(f"Error al hashear contraseña: {str(e)}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica que la contraseña ingresada coincida con el hash almacenado.
    """
    return pwd_context.verify(plain_password, hashed_password)

def crear_token(data: dict):
    """
    Crea un JWT con expiración definida.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
