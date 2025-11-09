from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

# ============================
# 🔹 MODELO: USUARIO
# ============================
class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = {"schema": "autenticacion"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    alertas = relationship("AlertaPrecio", back_populates="usuario")


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
    alertas = relationship("AlertaPrecio", back_populates="producto")


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
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"))
    tienda_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.tiendas.id"))
    precio = Column(Float)
    fecha_actualizacion = Column(DateTime)

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
    __tablename__ = "alertas_precios"
    __table_args__ = {"schema": "alertas"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("catalogo.productos.id"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("autenticacion.usuarios.id"))
    precio_objetivo = Column(Float, nullable=False)
    fecha_creacion = Column(DateTime)

    producto = relationship("Producto", back_populates="alertas")
    usuario = relationship("Usuario", back_populates="alertas")
