from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# ---- Clase base (común) ----
class ProductoBase(BaseModel):
    nombre: str
    marca: Optional[str]
    modelo: Optional[str]

# ---- Para crear un nuevo producto ----
class ProductoCrear(ProductoBase):
    pass

# ---- Para mostrar producto (con ID y ofertas) ----
class OfertaBase(BaseModel):
    id: UUID
    precio: float
    fecha_actualizacion: Optional[datetime]
    tienda_id: UUID
    class Config:
        orm_mode = True

class ProductoMostrar(ProductoBase):
    id: UUID
    ofertas: Optional[List[OfertaBase]] = []

    class Config:
        orm_mode = True


from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# ---- Usuario ----
class UsuarioMostrar(BaseModel):
    id: UUID
    nombre: str
    email: str
    class Config:
        orm_mode = True

# ---- Alerta ----
class AlertaBase(BaseModel):
    id: UUID
    precio_objetivo: float
    fecha_creacion: Optional[datetime]
    usuario: Optional[UsuarioMostrar]
    class Config:
        orm_mode = True

# ---- Oferta ----
class OfertaBase(BaseModel):
    id: UUID
    precio: float
    fecha_actualizacion: Optional[datetime]
    tienda_id: UUID
    class Config:
        orm_mode = True

# ---- Producto ----
class ProductoBase(BaseModel):
    nombre: str
    marca: Optional[str]
    modelo: Optional[str]

class ProductoCrear(ProductoBase):
    pass

class ProductoMostrar(ProductoBase):
    id: UUID
    ofertas: Optional[List[OfertaBase]] = []
    alertas: Optional[List[AlertaBase]] = []

    class Config:
        orm_mode = True

# ============================
# 🔹 SCHEMAS DE ALERTAS
# ============================

class AlertaCrear(BaseModel):
    producto_id: UUID
    usuario_id: UUID
    precio_objetivo: float

class AlertaBase(BaseModel):
    id: UUID
    precio_objetivo: float
    fecha_creacion: Optional[datetime] = None
    producto: Optional["ProductoMostrar"]
    usuario: Optional["UsuarioMostrar"]

    class Config:
        orm_mode = True