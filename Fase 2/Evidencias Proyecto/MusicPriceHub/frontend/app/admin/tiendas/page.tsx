"use client";

import { useEffect, useState } from "react";

const API_URL = "https://musicpricehub.onrender.com";

export default function AdminTiendasPage() {
  // ===============================
  // ESTADOS
  // ===============================
  const [usuario, setUsuario] = useState<any>(null);
  const [validando, setValidando] = useState(true);

  const [tiendas, setTiendas] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Modal editar
  const [editando, setEditando] = useState(false);
  const [editId, setEditId] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editSitio, setEditSitio] = useState("");

  // ===============================
  // Cargar usuario
  // ===============================
  useEffect(() => {
    const uStr = localStorage.getItem("usuario");
    if (!uStr) {
      setValidando(false);
      return;
    }

    try {
      setUsuario(JSON.parse(uStr));
    } catch {
      setUsuario(null);
    }

    setValidando(false);
  }, []);

  // ===============================
  // Cargar tiendas
  // ===============================
  const cargarTiendas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tiendas`);
      setTiendas(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarTiendas();
  }, []);

  // ===============================
  // Crear tienda
  // ===============================
  const handleCrearTienda = async (e: any) => {
    e.preventDefault();
    setMensaje("");

    if (!nombre.trim()) return setMensaje("Debe ingresar un nombre");

    const res = await fetch(`${API_URL}/api/tiendas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        sitio_web: sitioWeb || null,
        url: sitioWeb || null
      })
    });

    if (!res.ok) return setMensaje("Error al crear tienda");

    setMensaje("Tienda creada ✔️");
    setNombre("");
    setSitioWeb("");
    cargarTiendas();
  };

  // ===============================
  // Abrir modal editar
  // ===============================
  const abrirEditar = (t: any) => {
    setEditId(t.id);
    setEditNombre(t.nombre);
    setEditSitio(t.sitio_web || "");
    setEditando(true);
  };

  // ===============================
  // Guardar edición
  // ===============================
  const guardarEdicion = async () => {
    const res = await fetch(`${API_URL}/api/tiendas/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: editNombre,
        sitio_web: editSitio || null,
        url: editSitio || null
      })
    });

    if (!res.ok) {
      alert("Error al actualizar");
      return;
    }

    setEditando(false);
    cargarTiendas();
  };

  // ===============================
  // Eliminar tienda
  // ===============================
  const eliminarTienda = async (id: string) => {
    if (!confirm("¿Eliminar tienda?")) return;

    const res = await fetch(`${API_URL}/api/tiendas/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Error al eliminar");
      return;
    }

    cargarTiendas();
  };

  // ===============================
  // RENDER DE SEGURIDAD (ADMIN)
  // ===============================
  if (validando) return <p className="p-6 text-center">Cargando...</p>;

  if (!usuario?.es_admin)
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400">Acceso denegado</h1>
      </main>
    );

  // ===============================
  // RENDER PRINCIPAL
  // ===============================
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-brand-accent">
        Administrar Tiendas
      </h1>

      {/* FORM NUEVA TIENDA */}
      <section className="p-4 bg-[#0f172a] border border-gray-700 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-3">Agregar nueva tienda</h2>

        {mensaje && <p className="mb-3 text-sm text-gray-300">{mensaje}</p>}

        <form onSubmit={handleCrearTienda} className="space-y-3">
          <input
            className="w-full p-2 rounded bg-brand-card"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            className="w-full p-2 rounded bg-brand-card"
            placeholder="Sitio web (opcional)"
            value={sitioWeb}
            onChange={(e) => setSitioWeb(e.target.value)}
          />

          <button className="bg-brand-accent text-black p-2 rounded w-full font-semibold">
            Crear tienda
          </button>
        </form>
      </section>

      {/* LISTA TIENDAS */}
      <h2 className="text-xl font-semibold mb-3">Tiendas registradas</h2>

      <div className="space-y-2">
        {tiendas.map((t) => (
          <div
            key={t.id}
            className="p-3 bg-[#1e293b] rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{t.nombre}</p>
              {t.sitio_web && (
                <a
                  href={t.sitio_web}
                  target="_blank"
                  className="text-blue-400 text-sm"
                >
                  {t.sitio_web}
                </a>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => abrirEditar(t)}
                className="px-3 py-1 bg-yellow-500 text-black rounded"
              >
                Editar
              </button>

              <button
                onClick={() => eliminarTienda(t.id)}
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
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
          <div className="bg-[#0f172a] p-6 rounded-xl w-[400px] border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Editar tienda</h3>

            <input
              className="w-full p-2 rounded bg-brand-card mb-3"
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
            />

            <input
              className="w-full p-2 rounded bg-brand-card mb-3"
              value={editSitio}
              onChange={(e) => setEditSitio(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setEditando(false)}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={guardarEdicion}
                className="px-3 py-1 bg-brand-accent text-black rounded font-bold"
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
