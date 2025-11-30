"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function ProductoDetallePage() {
  const { id } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 estado para formulario de tiendas/ofertas
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [tiendaId, setTiendaId] = useState("");
  const [urlProducto, setUrlProducto] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("Disponible");
  const [formMsg, setFormMsg] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // ============================
  // CARGAR DETALLE PRODUCTO
  // ============================
  const cargarDetalle = async () => {
    if (!id) return;
    try {
      const res = await fetch(
        `${API_URL}/api/productos/${id}/detalle-frontend`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  // ============================
  // CARGAR LISTA DE TIENDAS
  // ============================
  useEffect(() => {
    const cargarTiendas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tiendas`);
        if (!res.ok) return;
        const json = await res.json();
        setTiendas(json);
      } catch (err) {
        console.error("Error al cargar tiendas", err);
      }
    };
    cargarTiendas();
  }, []);

  if (loading || !data) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <p className="text-center text-gray-400">Cargando producto...</p>
      </main>
    );
  }

  const p = data.producto;
  const precios = data.precios ?? [];

  // ============================
  // HANDLER: AGREGAR OFERTA
  // ============================
  const handleAgregarOferta = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg("");
    if (!id) return;
    if (!tiendaId || !urlProducto || !precioOferta) {
      setFormMsg("Completa todos los campos.");
      return;
    }

    try {
      setFormLoading(true);

      // 1) Crear relación TiendaProducto
      const resTP = await fetch(`${API_URL}/api/tiendas/agregar-producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tienda_id: tiendaId,
          producto_id: id,
          url_producto: urlProducto,
          sku_tienda: null,
        }),
      });

      if (!resTP.ok) {
        const errText = await resTP.text();
        console.error("Error tienda_producto:", errText);
        throw new Error("No se pudo asociar la tienda al producto");
      }

      const tp = await resTP.json();
      const tiendaProductoId = tp.tienda_producto.id;

      // 2) Crear oferta (precio) asociada a esa tienda_producto
      const resOferta = await fetch(`${API_URL}/api/tiendas/agregar-oferta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tienda_producto_id: tiendaProductoId,
          precio_centavos: parseInt(precioOferta, 10),
          disponibilidad,
          moneda: "CLP",
        }),
      });

      if (!resOferta.ok) {
        const errText = await resOferta.text();
        console.error("Error oferta:", errText);
        throw new Error("No se pudo crear la oferta");
      }

      setFormMsg("✅ Oferta agregada correctamente");
      setUrlProducto("");
      setPrecioOferta("");
      setDisponibilidad("Disponible");

      // recargar detalle para ver la nueva lista de precios
      cargarDetalle();
    } catch (err: any) {
      console.error(err);
      setFormMsg("❌ Error al agregar la oferta");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 flex gap-10">
      {/* Imagen */}
      <div className="flex-1 flex justify-center">
        <img
          src={p.imagen_url}
          alt={p.nombre}
          className="w-[420px] h-[420px] object-cover rounded-xl shadow"
        />
      </div>

      {/* Info + precios */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2">{p.nombre}</h1>
        <p className="text-gray-400 mb-6">
          {p.marca} {p.modelo}
        </p>

        <p className="mb-6 whitespace-pre-line">{p.descripcion}</p>

        <h2 className="text-xl font-semibold mb-3">Precios por tienda</h2>

        {precios.length === 0 && (
          <p className="text-gray-500 mb-4">
            Este producto no tiene ofertas aún.
          </p>
        )}

        <div className="space-y-3 mb-8">
          {precios.map((x: any, i: number) => (
            <a
              key={i}
              href={x.url_producto}
              className="block p-4 rounded-lg bg-[#111827] hover:bg-[#1f2937]"
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex justify-between items-center">
                <strong>{x.tienda}</strong>
                <span className="text-brand-accent font-bold text-lg">
                  ${(x.precio).toLocaleString("es-CL")}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{x.disponibilidad}</p>
            </a>
          ))}
        </div>

        {/* ============================
            FORMULARIO: AGREGAR OFERTA
           ============================ */}
        <section className="mt-6 p-4 rounded-xl bg-[#020617] border border-gray-800">
          <h3 className="text-lg font-semibold mb-3">
            Agregar oferta de tienda (uso interno)
          </h3>

          {formMsg && (
            <p className="mb-3 text-sm">
              {formMsg}
            </p>
          )}

          <form className="space-y-3" onSubmit={handleAgregarOferta}>
            {/* Tienda */}
            <div>
              <label className="block text-sm mb-1">Tienda</label>
              <select
                className="w-full p-2 rounded bg-brand-card"
                value={tiendaId}
                onChange={(e) => setTiendaId(e.target.value)}
              >
                <option value="">Selecciona una tienda</option>
                {tiendas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* URL producto */}
            <div>
              <label className="block text-sm mb-1">
                URL del producto en la tienda
              </label>
              <input
                className="w-full p-2 rounded bg-brand-card"
                placeholder="https://tienda.cl/producto-123"
                value={urlProducto}
                onChange={(e) => setUrlProducto(e.target.value)}
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm mb-1">
                Precio oferta (en centavos, ej: 1299990)
              </label>
              <input
                type="number"
                className="w-full p-2 rounded bg-brand-card"
                value={precioOferta}
                onChange={(e) => setPrecioOferta(e.target.value)}
              />
            </div>

            {/* Disponibilidad */}
            <div>
              <label className="block text-sm mb-1">Disponibilidad</label>
              <input
                className="w-full p-2 rounded bg-brand-card"
                value={disponibilidad}
                onChange={(e) => setDisponibilidad(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="bg-brand-accent text-black px-4 py-2 rounded font-semibold w-full disabled:opacity-60"
            >
              {formLoading ? "Guardando..." : "Agregar oferta"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
