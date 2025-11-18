from pydantic import BaseModel, EmailStr, constr
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

# ---- Crear usuario ----
class UsuarioCrear(BaseModel):
    nombre: str
    correo: EmailStr
    contraseña: constr(min_length=6, max_length=72)

# ---- Mostrar usuario ----
class UsuarioMostrar(BaseModel):
    id: UUID
    correo: EmailStr
    es_admin: bool
    perfil: Optional["PerfilMostrar"]

    class Config:
        from_attributes = True
 # ---- Mostrar perfil ---- 
class PerfilMostrar(BaseModel):
    nombre_publico: str
    pais: Optional[str]
    ciudad: Optional[str]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True
UsuarioMostrar.update_forward_refs()

 # ---- Usuario Login ---- 
class UsuarioLogin(BaseModel):
    correo: EmailStr
    contraseña: str


# ---- Alerta ----
class AlertaBase(BaseModel):
    id: UUID
    precio_objetivo: float
    fecha_creacion: Optional[datetime]
    usuario: Optional[UsuarioMostrar]
    class Config:
        from_attributes = True

# ---- Oferta ----
class OfertaBase(BaseModel):
    id: UUID
    precio: float
    fecha_actualizacion: Optional[datetime]
    tienda_id: UUID
    class Config:
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True
# ============================
# SCHEMAS COMUNIDAD 
# ============================

# Categorías
class CategoriaForoCrear(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaForoMostrar(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


# Temas
class TemaForoCrear(BaseModel):
    titulo: str
    categoria_id: Optional[UUID] = None

class TemaForoActualizar(BaseModel):
    titulo: Optional[str] = None
    categoria_id: Optional[UUID] = None
    fijado: Optional[bool] = None
    cerrado: Optional[bool] = None

class TemaForoMostrar(BaseModel):
    id: UUID
    titulo: str
    categoria_id: Optional[UUID]
    creado_por: UUID
    creado_en: datetime
    actualizado_en: datetime
    fijado: bool
    cerrado: bool

    class Config:
        from_attributes = True


# Mensajes
class MensajeForoCrear(BaseModel):
    contenido: str
    respuesta_a_id: Optional[UUID] = None  # para responder a otro mensaje

class MensajeForoActualizar(BaseModel):
    contenido: str

class MensajeForoMostrar(BaseModel):
    id: UUID
    tema_id: UUID
    usuario_id: UUID
    contenido: str
    creado_en: datetime
    actualizado_en: datetime
    respuesta_a_id: Optional[UUID]
    editado: bool
    eliminado: bool

    class Config:
        from_attributes = True


# Likes
class LikeMensajeMostrar(BaseModel):
    id: UUID
    mensaje_id: UUID
    usuario_id: UUID
    creado_en: datetime

    class Config:
        from_attributes = True


# Reportes
class ReporteMensajeCrear(BaseModel):
    motivo: str

class ReporteMensajeMostrar(BaseModel):
    id: UUID
    mensaje_id: UUID
    usuario_id: UUID
    motivo: str
    estado: str
    creado_en: datetime
    resuelto_en: Optional[datetime]
    resuelto_por: Optional[UUID]

    class Config:
        from_attributes = True

# ======================
# SCHEMA MENSAJE EN ÁRBOL
# ======================

class MensajeForoArbol(BaseModel):
    id: UUID
    usuario_id: UUID
    contenido: str
    creado_en: datetime
    actualizado_en: datetime
    editado: bool
    eliminado: bool
    respuesta_a_id: UUID | None
    respuestas: list["MensajeForoArbol"] = []

    class Config:
        from_attributes = True

MensajeForoArbol.update_forward_refs()