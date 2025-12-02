"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "https://musicpricehub.onrender.com";

type Producto = {
  id: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  imagen_url?: string | null;
};

type TiendaProducto = {
  id: string;
  tienda_id: string;
  producto_id: string;
  tienda_nombre: string;
  url_producto: string;
};

type Oferta = {
  id: string;
  tienda_producto_id: string;
  tienda_nombre: string;
  url_producto: string;
  precio_centavos: number;
  moneda: string;
  disponibilidad: string;
  fecha_listado: string;
  fecha_scraping: string;
};

export default function AdminPreciosProductoPage() {
  const params = useParams();
  const productoId = params?.id as string;

  const [usuario, setUsuario] = useState<any>(null);
  const [validando, setValidando] = useState(true);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [tiendasProd, setTiendasProd] = useState<TiendaProducto[]>([]);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  const [tiendaProductoSel, setTiendaProductoSel] = useState("");
  const [precio, setPrecio] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("Disponible");
  const [mensaje, setMensaje] = useState("");

  // Modal edición
  const [editando, setEditando] = useState(false);
  const [editOferta, setEditOferta] = useState<Oferta | null>(null);
  const [editPrecio, setEditPrecio] = useState("");
  const [editDisponibilidad, setEditDisponibilidad] = useState("Disponible");

  // ============================
  // Cargar usuario (para validar admin)
  // ============================
  useEffect(() => {
    const uStr = localStorage.getItem("usuario");
    if (uStr) {
      try {
        setUsuario(JSON.parse(uStr));
      } catch {
        setUsuario(null);
      }
    }
    setValidando(false);
  }, []);

  // ============================
  // Fetch helpers
  // ============================
  const cargarProducto = async () => {
    const res = await fetch(`${API_URL}/api/productos/${productoId}`);
    if (!res.ok) return;
    setProducto(await res.json());
  };

  const cargarTiendasProducto = async () => {
    const res = await fetch(`${API_URL}/api/tiendas/producto/${productoId}`);
    if (!res.ok) return;
    setTiendasProd(await res.json());
  };

  const cargarOfertas = async () => {
    const res = await fetch(`${API_URL}/api/tiendas/ofertas/producto/${productoId}`);
    if (!res.ok) return;
    const data: Oferta[] = await res.json();

    // Ordenar por precio (más barato primero)
    data.sort((a, b) => a.precio_centavos - b.precio_centavos);
    setOfertas(data);
  };

  useEffect(() => {
    if (!productoId) return;
    cargarProducto();
    cargarTiendasProducto();
    cargarOfertas();
  }, [productoId]);

  // ============================
  // Crear / actualizar oferta
  // ============================
  const handleAgregarOferta = async (e: any) => {
    e.preventDefault();
    setMensaje("");

    if (!tiendaProductoSel || !precio.trim()) {
      setMensaje("Debe seleccionar una tienda y un precio.");
      return;
    }

    const cuerpo = {
      tienda_producto_id: tiendaProductoSel,
      precio_centavos: parseInt(precio, 10),
      disponibilidad,
      moneda: "CLP",
    };

    try {
      const res = await fetch(`${API_URL}/api/tiendas/agregar-oferta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });

      if (!res.ok) {
        setMensaje("Error al guardar la oferta");
        return;
      }

      setMensaje("Oferta guardada correctamente ✔️");
      setPrecio("");
      setDisponibilidad("Disponible");
      setTiendaProductoSel("");
      await cargarOfertas();
    } catch (err) {
      console.error(err);
      setMensaje("Error inesperado al guardar la oferta");
    }
  };

  // ============================
  // Abrir modal de edición
  // ============================
  const abrirEditar = (oferta: Oferta) => {
    setEditOferta(oferta);
    setEditPrecio(String(oferta.precio_centavos));
    setEditDisponibilidad(oferta.disponibilidad || "Disponible");
    setEditando(true);
  };

  // ============================
  // Guardar edición
  // ============================
  const guardarEdicion = async () => {
    if (!editOferta) return;

    const cuerpo = {
      // OfertaCrear del backend necesita estos campos:
      tienda_producto_id: editOferta.tienda_producto_id,
      precio_centavos: parseInt(editPrecio, 10),
      disponibilidad: editDisponibilidad,
      moneda: editOferta.moneda || "CLP",
    };

    try {
      const res = await fetch(
        `${API_URL}/api/tiendas/ofertas/${editOferta.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        }
      );

      if (!res.ok) {
        alert("Error al actualizar la oferta");
        return;
      }

      setEditando(false);
      setEditOferta(null);
      await cargarOfertas();
    } catch (err) {
      console.error(err);
      alert("Error inesperado al actualizar");
    }
  };

  // ============================
  // Eliminar oferta
  // ============================
  const eliminarOferta = async (id: string) => {
    if (!confirm("¿Eliminar esta oferta?")) return;

    try {
      const res = await fetch(`${API_URL}/api/tiendas/ofertas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Error al eliminar la oferta");
        return;
      }

      await cargarOfertas();
    } catch (err) {
      console.error(err);
      alert("Error inesperado al eliminar");
    }
  };

  // ============================
  // RENDER: seguridad admin
  // ============================
  if (validando) {
    return <p className="p-6 text-center">Cargando...</p>;
  }

  if (!usuario?.es_admin) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400">Acceso denegado</h1>
        <p>No tienes permisos para administrar precios.</p>
      </main>
    );
  }

  // ============================
  // RENDER principal
  // ============================
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-brand-accent mb-6">
        Administrar precios del producto
      </h1>

      {/* Resumen producto */}
      {producto && (
        <div className="p-4 bg-[#0f172a] border border-gray-700 rounded-lg mb-8 flex gap-4">
          {producto.imagen_url && (
            <img
              src={producto.imagen_url}
              className="w-32 h-32 object-cover rounded-lg"
              alt={producto.nombre}
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{producto.nombre}</h2>
            <p className="text-gray-400">
              {producto.marca} — {producto.modelo}
            </p>
          </div>
        </div>
      )}

      {/* Formulario agregar oferta */}
      <section className="p-4 bg-[#1e293b] rounded-lg mb-8 space-y-3">
        <h2 className="text-xl font-semibold mb-2">Agregar / actualizar oferta</h2>

        {mensaje && <p className="text-sm text-gray-200">{mensaje}</p>}

        <select
          className="w-full p-2 bg-brand-card rounded"
          value={tiendaProductoSel}
          onChange={(e) => setTiendaProductoSel(e.target.value)}
        >
          <option value="">Seleccione una tienda (asociada al producto)</option>
          {tiendasProd.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {tp.tienda_nombre}
            </option>
          ))}
        </select>

        <input
          className="w-full p-2 bg-brand-card rounded"
          type="number"
          min={0}
          placeholder="Precio en centavos (ej: 1099990)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <select
          className="w-full p-2 bg-brand-card rounded"
          value={disponibilidad}
          onChange={(e) => setDisponibilidad(e.target.value)}
        >
          <option value="Disponible">Disponible</option>
          <option value="Agotado">Agotado</option>
          <option value="Preventa">Preventa</option>
        </select>

        <button
          onClick={handleAgregarOferta}
          className="bg-brand-accent text-black p-2 rounded w-full font-semibold"
        >
          Guardar oferta
        </button>
      </section>

      {/* Lista de ofertas */}
      <h2 className="text-xl font-semibold mb-3">Ofertas registradas</h2>

      {ofertas.length === 0 ? (
        <p className="text-gray-400">Este producto aún no tiene ofertas.</p>
      ) : (
        <div className="space-y-2">
          {ofertas.map((o) => (
            <div
              key={o.id}
              className="bg-[#1e293b] p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{o.tienda_nombre}</p>
                <a
                  href={o.url_producto}
                  target="_blank"
                  className="text-blue-400 text-sm"
                >
                  {o.url_producto}
                </a>
                <p className="text-sm text-gray-300 mt-1">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: o.moneda || "CLP",
                    maximumFractionDigits: 0,
                  }).format(o.precio_centavos)}{" "}
                  — {o.disponibilidad}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-400 text-black rounded"
                  onClick={() => abrirEditar(o)}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-black rounded"
                  onClick={() => eliminarOferta(o.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDITAR OFERTA */}
      {editando && editOferta && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-[#0f172a] w-[400px] p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">
              Editar oferta — {editOferta.tienda_nombre}
            </h3>

            <input
              className="w-full p-2 bg-brand-card rounded mb-3"
              type="number"
              min={0}
              value={editPrecio}
              onChange={(e) => setEditPrecio(e.target.value)}
            />

            <select
              className="w-full p-2 bg-brand-card rounded mb-4"
              value={editDisponibilidad}
              onChange={(e) => setEditDisponibilidad(e.target.value)}
            >
              <option value="Disponible">Disponible</option>
              <option value="Agotado">Agotado</option>
              <option value="Preventa">Preventa</option>
            </select>

            <div className="flex justify-between">
              <button
                className="px-3 py-1 bg-gray-600 rounded"
                onClick={() => {
                  setEditando(false);
                  setEditOferta(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 bg-brand-accent text-black rounded font-semibold"
                onClick={guardarEdicion}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
