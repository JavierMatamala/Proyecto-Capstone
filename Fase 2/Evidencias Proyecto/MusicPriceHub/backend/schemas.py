from pydantic import BaseModel, EmailStr, constr, UUID4, Field, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
# ============================
# PRODUCTOS
# ============================
class ProductoCrear(BaseModel):
    nombre: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    url_fuente: Optional[str] = None
    especificaciones: Optional[dict] = None
    categoria_id: Optional[UUID] = None
    precio_base_centavos: Optional[int] = None

class OfertaBase(BaseModel):
    id: UUID
    precio_centavos: int
    moneda: str
    disponibilidad: Optional[str] = None
    fecha_scraping: datetime
    tienda_id: UUID

    class Config:
        from_attributes = True



class ProductoMostrar(BaseModel):
    id: UUID
    nombre: str
    marca: Optional[str]
    modelo: Optional[str]
    descripcion: Optional[str]
    imagen_url: Optional[str]
    url_fuente: Optional[str]
    especificaciones: Optional[dict]
    precio_base_centavos: Optional[int]
    precio_final: Optional[int] = None        # 👈 ¡ESTE CAMPO ES OBLIGATORIO!
    ofertas: Optional[List[OfertaBase]] = []

    class Config:
        from_attributes = True

# ============================
# ofertas
# ============================

class OfertaTienda(BaseModel):
    tienda: str
    url_producto: str
    precio: int
    disponibilidad: Optional[str]

class ProductoDetalle(BaseModel):
    id: UUID
    nombre: str
    marca: Optional[str]
    modelo: Optional[str]
    descripcion: Optional[str]
    imagen_url: Optional[str]

    ofertas: List[OfertaTienda] = []

    class Config:
        from_attributes = True

# ---- Crear usuario ----

class UsuarioCrear(BaseModel):
    nombre: str
    correo: EmailStr
    contraseña: constr(min_length=6, max_length=72)

# ---- Mostrar usuario ----

class PerfilMostrar(BaseModel):
    nombre_publico: str
    region: Optional[str]
    comuna: Optional[str]
    avatar_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class UsuarioMostrar(BaseModel):
    id: UUID
    correo: EmailStr
    es_admin: bool
    perfil: Optional["PerfilMostrar"]

    model_config = ConfigDict(from_attributes=True)


UsuarioMostrar.model_rebuild()

# ---- Actualizar perfil ----

class PerfilActualizar(BaseModel):
    nombre_publico: Optional[str] = None
    region: Optional[str] = None
    comuna: Optional[str] = None
    avatar_url: Optional[str] = None

# ---- Usuario Login ----

class UsuarioLogin(BaseModel):
    correo: EmailStr
    contraseña: str

# ---- Alerta (versión antigua, parece duplicada) ----

class AlertaBase(BaseModel):
    id: UUID
    precio_objetivo: float
    fecha_creacion: Optional[datetime]
    usuario: Optional[UsuarioMostrar]

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
    producto: Optional[ProductoMostrar]
    usuario: Optional[UsuarioMostrar]

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

# Likes

class LikeMensajeMostrar(BaseModel):
    id: UUID
    mensaje_id: UUID
    usuario_id: UUID
    creado_en: datetime

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)


MensajeForoArbol.model_rebuild()

# ============================
# 🔹 MERCADO: IMÁGENES
# ============================

class ImagenPublicacionBase(BaseModel):
    url_imagen: str
    orden: Optional[int] = 0


class ImagenPublicacionCrear(ImagenPublicacionBase):
    pass


class ImagenPublicacionMostrar(ImagenPublicacionBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

# ============================
# 🔹 MERCADO: DATOS VENDEDOR
# ============================

class DatosVendedor(BaseModel):
    id: UUID
    correo: EmailStr
    nombre_publico: Optional[str] = None
    avatar_url: Optional[str] = None

# ============================
# 🔹 MERCADO: PUBLICACIONES
# ============================

class PublicacionMercadoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    producto_id: Optional[UUID] = None
    precio_centavos: int
    moneda: str = "CLP"
    ciudad: Optional[str] = None


class PublicacionMercadoCrear(PublicacionMercadoBase):
    imagenes: List[ImagenPublicacionCrear] = []


class PublicacionMercadoMostrar(PublicacionMercadoBase):
    id: UUID
    estado: str
    creada_en: datetime
    actualizada_en: datetime
    vendedor: DatosVendedor
    imagenes: List[ImagenPublicacionMostrar]

    model_config = ConfigDict(from_attributes=True)


class PublicacionMercadoListado(BaseModel):
    id: UUID
    titulo: str
    precio_centavos: int
    moneda: str
    ciudad: Optional[str]
    imagen_principal: Optional[str]
    vendedor_nombre: Optional[str]

    model_config = ConfigDict(from_attributes=True)

# ============================
# 🔹 MERCADO: IMÁGENES PUBLICACIÓN (DUPLICADO EN TU ARCHIVO)
# ============================

class ImagenPublicacionMostrar(BaseModel):
    id: UUID
    url_imagen: str
    orden: int

    model_config = ConfigDict(from_attributes=True)

# ============================
# 🔹 MERCADO: CONVERSACION CREAR
# ============================

class ConversacionCrear(BaseModel):
    usuario1_id: UUID
    usuario2_id: UUID
    publicacion_id: UUID

# ============================
# 🔹 MERCADO: CONVERSACION OUT
# ============================

class ConversacionOut(BaseModel):
    id: UUID
    usuario1_id: UUID
    usuario2_id: UUID
    publicacion_id: UUID
    creada_en: datetime

    model_config = ConfigDict(from_attributes=True)

# ============================
# SCHEMA: MENSAJE CREAR
# ============================

class MensajeCrear(BaseModel):
    conversacion_id: UUID
    remitente_id: UUID
    receptor_id: UUID
    contenido: str

# ============================
# 🔹 MERCADO: MENSAJE OUT
# ============================

class MensajeOut(BaseModel):
    id: UUID
    conversacion_id: UUID
    remitente_id: UUID
    receptor_id: UUID
    contenido: str
    enviado_en: datetime
    leido: bool

    model_config = ConfigDict(from_attributes=True)


class ConversacionItem(BaseModel):
    id: UUID
    publicacion_id: UUID
    otro_usuario_id: UUID
    ultimo_mensaje: str | None
    enviado_en: datetime | None
    no_leidos: int

    model_config = ConfigDict(from_attributes=True)

# =============================
# SCHEMAS PARA CHAT (mercado)
# =============================

class MensajeResponse(BaseModel):
    id: UUID
    conversacion_id: UUID
    remitente_id: UUID
    receptor_id: UUID
    contenido: str
    enviado_en: datetime
    leido: bool

    model_config = ConfigDict(from_attributes=True)


class ConversacionResponse(BaseModel):
    id: UUID4
    usuario1_id: UUID4
    usuario2_id: UUID4
    publicacion_id: UUID4
    creada_en: datetime
    mensajes: list[MensajeResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MensajeResponse(BaseModel):
    id: str
    remitente_id: str
    receptor_id: str
    contenido: str
    enviado_en: datetime
    leido: bool

    model_config = ConfigDict(from_attributes=True)


class UltimoMensajeResponse(BaseModel):
    contenido: str
    enviado_en: datetime
    remitente_id: str


class ConversacionListaResponse(BaseModel):
    id: str
    publicacion_id: str
    otro_usuario_id: str
    otro_usuario_nombre: str
    ultimo_mensaje: Optional[UltimoMensajeResponse] = None



class TiendaProductoCrear(BaseModel):
    tienda_id: str
    producto_id: str
    url_producto: str
    sku_tienda: str | None = None


class OfertaCrear(BaseModel):
    tienda_producto_id: str
    precio_centavos: int
    disponibilidad: str = "Disponible"
    moneda: str = "CLP"
