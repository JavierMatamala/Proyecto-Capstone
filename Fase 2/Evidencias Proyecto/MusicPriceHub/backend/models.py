from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
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


# ============================
# 🔹 MODELO: PERFIL
# ============================
class Perfil(Base):
    __tablename__ = "perfiles"
    __table_args__ = {"schema": "autenticacion"}

    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"), primary_key=True)
    nombre_publico = Column(String, nullable=False)
    pais = Column(String)
    ciudad = Column(String)
    avatar_url = Column(String)
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en = Column(DateTime(timezone=True), default=datetime.utcnow)

    # 🔗 Relación inversa hacia Usuario
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

    ofertas = relationship("OfertaActual", back_populates="producto")
    historial = relationship("HistorialPrecio", back_populates="producto")
    alertas_precio = relationship("AlertaPrecio", back_populates="producto")


# ============================
# 🔹 MODELO: TIENDA
# ============================
class Tienda(Base):
    __tablename__ = "tiendas"
    __table_args__ = {"schema": "catalogo"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    url = Column(String)

    ofertas = relationship("OfertaActual", back_populates="tienda")


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
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"))
    precio = Column(Float)
    fecha = Column(DateTime)

    producto = relationship("Producto", back_populates="historial")


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
