"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "https://musicpricehub.onrender.com";

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos`);
        const json = await res.json();
        setProductos(json);
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-400">Cargando productos...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-brand-accent mb-6">
        Administrar precios — Selecciona un producto
      </h1>

      <div className="space-y-4">
        {productos.map((p) => (
          <div
            key={p.id}
            className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={p.imagen_url}
                className="w-16 h-16 rounded object-cover bg-black/20"
                alt={p.nombre}
              />
              <div>
                <p className="font-semibold">{p.nombre}</p>
                <p className="text-gray-400 text-sm">
                  {p.marca} — {p.modelo}
                </p>
              </div>
            </div>

            <Link
              href={`/admin/producto/${p.id}/precios`}
              className="px-4 py-2 rounded bg-brand-accent text-black font-semibold hover:bg-brand-accent-soft"
            >
              Administrar precios
            </Link>
          </div>
        ))}
      </div>

    </main>
  );
}
