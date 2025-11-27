from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from database import Base


# ============================
# 🔹 MODELO: USUARIO
# ============================
class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = {"schema": "autenticacion"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    correo = Column(String, nullable=False, unique=True)
    contrasena_hash = Column(Text, nullable=False)
    es_admin = Column(Boolean, default=False)
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 🔗 Relaciones
    perfil = relationship("Perfil", back_populates="usuario", uselist=False)
    alertas_precio = relationship("AlertaPrecio", back_populates="usuario", cascade="all, delete-orphan")
    publicaciones_mercado = relationship(
        "PublicacionMercado",
        back_populates="vendedor",
        cascade="all, delete-orphan"
    )


# ============================
# 🔹 MODELO: PERFIL
# ============================
class Perfil(Base):
    __tablename__ = "perfiles"
    __table_args__ = {"schema": "autenticacion"}

    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), primary_key=True)
    nombre_publico = Column(String, nullable=False)

    # 🔥 NUEVOS CAMPOS
    region = Column(String)
    comuna = Column(String)
    avatar_url = Column(String)

    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en = Column(DateTime(timezone=True), default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="perfil")


# ============================
# 🔹 MODELO: PRODUCTO
# ============================
class Producto(Base):
    __tablename__ = "productos"
    __table_args__ = {"schema": "catalogo"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    marca = Column(String)
    modelo = Column(String)
    imagen_url = Column(String, nullable=True)
    
    ofertas = relationship("OfertaActual", back_populates="producto")
    alertas_precio = relationship("AlertaPrecio", back_populates="producto")
    tiendas_producto = relationship("TiendaProducto", back_populates="producto")


# ============================
# 🔹 MODELO: TIENDA_PRODUCTO
# ============================
class TiendaProducto(Base):
    __tablename__ = "tienda_productos"
    __table_args__ = {"schema": "catalogo"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tienda_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.tiendas.id"), nullable=False)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"), nullable=False)

    sku_tienda = Column(String, nullable=True)
    url_producto = Column(String, nullable=False)
    activo = Column(Boolean, default=True)

    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en = Column(DateTime(timezone=True), default=datetime.utcnow)

    tienda = relationship("Tienda", back_populates="productos_tienda")
    producto = relationship("Producto", back_populates="tiendas_producto")


# ============================
# 🔹 MODELO: TIENDA
# ============================
class Tienda(Base):
    __tablename__ = "tiendas"
    __table_args__ = {"schema": "catalogo"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    url = Column(String)
    sitio_web = Column(String) 

    ofertas = relationship("OfertaActual", back_populates="tienda")
    tareas_scraping = relationship("TareaScraping", back_populates="tienda")
    productos_tienda = relationship("TiendaProducto", back_populates="tienda")


# ============================
# 🔹 MODELO: OFERTA ACTUAL
# ============================
class OfertaActual(Base):
    __tablename__ = "ofertas_actuales"
    __table_args__ = {"schema": "precios"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tienda_producto_id = Column(UUID(as_uuid=True), nullable=False)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"), nullable=False)
    tienda_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.tiendas.id"))

    precio_centavos = Column(Integer, nullable=False)
    moneda = Column(String, nullable=False, default="CLP")
    disponibilidad = Column(String)
    fecha_listado = Column(DateTime(timezone=True), nullable=False)
    fecha_scraping = Column(DateTime(timezone=True), nullable=False, default=datetime.now)

    producto = relationship("Producto", back_populates="ofertas")
    tienda = relationship("Tienda", back_populates="ofertas")


# ============================
# 🔹 MODELO: HISTORIAL DE PRECIOS
# ============================
class HistorialPrecio(Base):
    __tablename__ = "historial_precios"
    __table_args__ = {"schema": "precios"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tienda_producto_id = Column(UUID(as_uuid=True), nullable=False)
    precio_centavos = Column(Integer, nullable=False)
    moneda = Column(String, default="CLP")
    disponibilidad = Column(String)
    valido_desde = Column(DateTime(timezone=True))
    fuente = Column(String)
    fecha_scraping = Column(DateTime(timezone=True), default=datetime.utcnow)


# ============================
# 🔹 MODELO: ALERTA DE PRECIO
# ============================
class AlertaPrecio(Base):
    __tablename__ = "alertas_precio"
    __table_args__ = {"schema": "alertas"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"), nullable=False)
    precio_objetivo = Column(Integer, nullable=False)
    moneda = Column(Text, nullable=False, default="CLP")
    activa = Column(Boolean, nullable=False, default=True)
    creada_en = Column(DateTime(timezone=True), default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="alertas_precio")
    producto = relationship("Producto", back_populates="alertas_precio")


# ============================
# 🔹 COMUNIDAD — CATEGORÍAS
# ============================
class CategoriaForo(Base):
    __tablename__ = "categorias_foro"
    __table_args__ = {"schema": "comunidad"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(Text)

    temas = relationship("TemaForo", back_populates="categoria", cascade="all, delete-orphan")


class TemaForo(Base):
    __tablename__ = "temas_foro"
    __table_args__ = {"schema": "comunidad"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(Text, nullable=False)
    categoria_id = Column(UUID(as_uuid=True), ForeignKey("comunidad.categorias_foro.id"), nullable=True)
    creado_por = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    fijado = Column(Boolean, default=False)
    cerrado = Column(Boolean, default=False)

    categoria = relationship("CategoriaForo", back_populates="temas")
    creador = relationship("Usuario")
    mensajes = relationship("MensajeForo", back_populates="tema", cascade="all, delete-orphan")


class MensajeForo(Base):
    __tablename__ = "mensajes_foro"
    __table_args__ = {"schema": "comunidad"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tema_id = Column(UUID(as_uuid=True), ForeignKey("comunidad.temas_foro.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    contenido = Column(Text, nullable=False)
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    respuesta_a_id = Column(UUID(as_uuid=True), ForeignKey("comunidad.mensajes_foro.id"), nullable=True)
    editado = Column(Boolean, default=False)
    eliminado = Column(Boolean, default=False)

    tema = relationship("TemaForo", back_populates="mensajes")
    usuario = relationship("Usuario")
    respuesta_a = relationship("MensajeForo", remote_side=[id])
    likes = relationship("LikeMensajeForo", back_populates="mensaje", cascade="all, delete-orphan")
    reportes = relationship("ReporteMensajeForo", back_populates="mensaje", cascade="all, delete-orphan")


class LikeMensajeForo(Base):
    __tablename__ = "likes_mensajes_foro"
    __table_args__ = {"schema": "comunidad"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mensaje_id = Column(UUID(as_uuid=True), ForeignKey("comunidad.mensajes_foro.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)

    mensaje = relationship("MensajeForo", back_populates="likes")
    usuario = relationship("Usuario")


class ReporteMensajeForo(Base):
    __tablename__ = "reportes_mensajes_foro"
    __table_args__ = {"schema": "comunidad"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mensaje_id = Column(UUID(as_uuid=True), ForeignKey("comunidad.mensajes_foro.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    motivo = Column(Text, nullable=False)
    estado = Column(String, default="pendiente")
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    resuelto_en = Column(DateTime(timezone=True), nullable=True)
    resuelto_por = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=True)

    mensaje = relationship("MensajeForo", back_populates="reportes")
    usuario = relationship("Usuario", foreign_keys=[usuario_id])
    moderador = relationship("Usuario", foreign_keys=[resuelto_por])


# ============================
# 🔹 SCRAPING
# ============================
class TareaScraping(Base):
    __tablename__ = "tareas_scraping"
    __table_args__ = {"schema": "operaciones"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tienda_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.tiendas.id"), nullable=False)
    inicio_en = Column(DateTime(timezone=True), server_default=func.now())
    fin_en = Column(DateTime(timezone=True))
    estado = Column(String, nullable=False, default="pendiente")
    detalle = Column(Text)

    tienda = relationship("Tienda", back_populates="tareas_scraping")
    resultados = relationship("ResultadoScraping", back_populates="tarea", cascade="all, delete-orphan")


class ResultadoScraping(Base):
    __tablename__ = "resultados_scraping"
    __table_args__ = {"schema": "operaciones"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tarea_id = Column(UUID(as_uuid=True), ForeignKey("operaciones.tareas_scraping.id"), nullable=False)
    url_producto = Column(Text, nullable=False)
    datos_extraidos = Column(JSONB, nullable=False)
    obtenido_en = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String, nullable=False, default="ok")

    tarea = relationship("TareaScraping", back_populates="resultados")


# ============================
# 🔹 PUBLICACIÓN MERCADO
# ============================
class PublicacionMercado(Base):
    __tablename__ = "publicaciones"
    __table_args__ = {"schema": "mercado"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendedor_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    titulo = Column(Text, nullable=False)
    descripcion = Column(Text, nullable=True)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"), nullable=True)
    precio_centavos = Column(Integer, nullable=False)
    moneda = Column(String, nullable=False, default="CLP")
    estado = Column(String, nullable=False, default="activa")
    ciudad = Column(String, nullable=True)
    creada_en = Column(DateTime(timezone=True), server_default=func.now())
    actualizada_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vendedor = relationship("Usuario", back_populates="publicaciones_mercado")
    imagenes = relationship("ImagenPublicacion", back_populates="publicacion", cascade="all, delete-orphan")


class ImagenPublicacion(Base):
    __tablename__ = "imagenes_publicacion"
    __table_args__ = {"schema": "mercado"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    publicacion_id = Column(UUID(as_uuid=True), ForeignKey("mercado.publicaciones.id"), nullable=False)
    url_imagen = Column(Text, nullable=False)
    orden = Column(Integer, nullable=False, default=0)

    publicacion = relationship("PublicacionMercado", back_populates="imagenes")


# ============================
# 🔹 CONVERSACION (FINAL)
# ============================
class Conversacion(Base):
    __tablename__ = "conversaciones"
    __table_args__ = {"schema": "mercado"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario1_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    usuario2_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    publicacion_id = Column(UUID(as_uuid=True), ForeignKey("mercado.publicaciones.id"), nullable=False)
    creada_en = Column(DateTime(timezone=True), server_default=func.now())

    mensajes = relationship("Mensaje", back_populates="conversacion", cascade="all, delete-orphan")


# ============================
# 🔹 MENSAJE
# ============================
class Mensaje(Base):
    __tablename__ = "mensajes"
    __table_args__ = {"schema": "mercado"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversacion_id = Column(UUID(as_uuid=True), ForeignKey("mercado.conversaciones.id", ondelete="CASCADE"), nullable=False)
    remitente_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    receptor_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), nullable=False)
    contenido = Column(Text, nullable=False)
    enviado_en = Column(DateTime(timezone=True), server_default=func.now())
    leido = Column(Boolean, default=False)

    conversacion = relationship("Conversacion", back_populates="mensajes")
