"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "https://musicpricehub.onrender.com";

export default function AdminProductoTiendasPage() {
  const params = useParams();
  const productoId = params?.id;

  const [usuario, setUsuario] = useState<any>(null);
  const [validando, setValidando] = useState(true);

  const [producto, setProducto] = useState<any>(null);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [todasTiendas, setTodasTiendas] = useState<any[]>([]);

  const [tiendaSeleccionada, setTiendaSeleccionada] = useState("");
  const [urlProducto, setUrlProducto] = useState("");

  const [editando, setEditando] = useState(false);
  const [editId, setEditId] = useState("");
  const [editURL, setEditURL] = useState("");

  // ================================
  // Cargar usuario
  // ================================
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

  // ================================
  // Cargar datos del producto
  // ================================
  const cargarProducto = async () => {
    const res = await fetch(`${API_URL}/api/productos/${productoId}`);
    if (!res.ok) return;
    setProducto(await res.json());
  };

  // ================================
  // Cargar tiendas del producto
  // ================================
  const cargarTiendasProducto = async () => {
    const res = await fetch(`${API_URL}/api/tiendas/producto/${productoId}`);
    if (!res.ok) return;
    setTiendas(await res.json());
  };

  // ================================
  // Cargar todas las tiendas
  // ================================
  const cargarTodasTiendas = async () => {
    const res = await fetch(`${API_URL}/api/tiendas`);
    setTodasTiendas(await res.json());
  };

  useEffect(() => {
    if (!productoId) return;
    cargarProducto();
    cargarTiendasProducto();
    cargarTodasTiendas();
  }, [productoId]);

  // ================================
  // Agregar tienda al producto
  // ================================
  const agregarTienda = async () => {
    if (!tiendaSeleccionada || !urlProducto.trim()) return alert("Complete los campos");

    const res = await fetch(`${API_URL}/api/tiendas/agregar-producto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tienda_id: tiendaSeleccionada,
        producto_id: productoId,
        url_producto: urlProducto
      })
    });

    if (!res.ok) {
      alert("Error al agregar tienda");
      return;
    }

    setTiendaSeleccionada("");
    setUrlProducto("");
    cargarTiendasProducto();
  };

  // ================================
  // Abrir modal editar URL
  // ================================
  const abrirEditar = (t: any) => {
    setEditId(t.id);
    setEditURL(t.url_producto);
    setEditando(true);
  };

  // ================================
  // Guardar edición
  // ================================
  const guardarEdicion = async () => {
    const res = await fetch(`${API_URL}/api/tiendas/editar-producto/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url_producto: editURL
      })
    });

    if (!res.ok) {
      alert("Error al actualizar");
      return;
    }

    setEditando(false);
    cargarTiendasProducto();
  };

  // ================================
  // Eliminar
  // ================================
  const eliminarRelacion = async (id: string) => {
    if (!confirm("¿Eliminar esta tienda del producto?")) return;

    const res = await fetch(`${API_URL}/api/tiendas/eliminar-producto/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Error al eliminar");
      return;
    }

    cargarTiendasProducto();
  };

  // ================================
  // Render seguridad
  // ================================
  if (validando) return <p className="p-6">Cargando...</p>;
  if (!usuario?.es_admin) return <p className="p-6">Acceso denegado</p>;

  // ================================
  // Render UI principal
  // ================================
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-brand-accent mb-6">
        Administrar tiendas del producto
      </h1>

      {producto && (
        <div className="p-4 bg-[#0f172a] border border-gray-700 rounded-lg mb-8 flex gap-4">
          <img
            src={producto.imagen_url}
            className="w-32 h-32 object-cover rounded-lg"
            alt=""
          />
          <div>
            <h2 className="text-xl font-bold">{producto.nombre}</h2>
            <p className="text-gray-400">{producto.marca} — {producto.modelo}</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">Agregar tienda al producto</h2>

      <div className="p-4 bg-[#1e293b] rounded-lg mb-8 space-y-3">
        <select
          className="w-full p-2 bg-brand-card rounded"
          value={tiendaSeleccionada}
          onChange={(e) => setTiendaSeleccionada(e.target.value)}
        >
          <option value="">Seleccione una tienda</option>
          {todasTiendas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>

        <input
          className="w-full p-2 bg-brand-card rounded"
          placeholder="URL del producto"
          value={urlProducto}
          onChange={(e) => setUrlProducto(e.target.value)}
        />

        <button
          className="bg-brand-accent text-black p-2 rounded w-full font-semibold"
          onClick={agregarTienda}
        >
          Agregar tienda
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Tiendas asociadas</h2>

      <div className="space-y-2">
        {tiendas.map((t) => (
          <div
            key={t.id}
            className="bg-[#1e293b] p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{t.tienda_nombre}</p>
              <a
                href={t.url_producto}
                target="_blank"
                className="text-blue-400 text-sm"
              >
                {t.url_producto}
              </a>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => abrirEditar(t)}
                className="px-3 py-1 bg-yellow-400 text-black rounded"
              >
                Editar
              </button>

              <button
                onClick={() => eliminarRelacion(t.id)}
                className="px-3 py-1 bg-red-600 text-black rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDITAR */}
      {editando && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-[#0f172a] w-[400px] p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Editar URL</h3>

            <input
              className="w-full p-2 bg-brand-card rounded mb-4"
              value={editURL}
              onChange={(e) => setEditURL(e.target.value)}
            />

            <div className="flex justify-between">
              <button
                className="px-3 py-1 bg-gray-600 rounded"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>

              <button
                className="px-3 py-1 bg-brand-accent text-black rounded"
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
