"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ← AÑADIDO

type Oferta = {
  precio_final: number;
};

type Producto = {
  id: string;
  nombre: string;
  marca?: string;
  modelo?: string;
  imagen_url?: string;
  precio_final?: number;   // ← EL PRECIO VIENE DESDE EL BACKEND
};

export default function HomePage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const resp = await fetch("https://musicpricehub.onrender.com/productos");
        if (!resp.ok) {
          const err = await resp.json().catch(() => null);
          setError(
            typeof err?.detail === "string"
              ? err.detail
              : "No se pudieron cargar los productos."
          );
          return;
        }
        const data = await resp.json();
        setProductos(data);
      } catch (_) {
        setError("Error de conexión al cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);
useEffect(() => {
  fetch("https://musicpricehub.onrender.com/api/productos/")
    .then((res) => res.json())
    .then((data) => {
      console.log("📦 PRODUCTOS RECIBIDOS DESDE LA API:", data);
      setProductos(data);
    })
    .catch(() => setError("No se pudo conectar con la API."));
}, []);

  if (loading) {
    return <p className="p-4">Cargando productos...</p>;
  }

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎶 Productos disponibles</h2>

      {error && (
        <p className="mb-4 text-sm text-red-500">
          {typeof error === "string"
            ? error
            : "Ocurrió un error al cargar los productos."}
        </p>
      )}

      {productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.id}`}      // ← AQUÍ LLEVA AL DETALLE
              className="bg-brand-card rounded-xl p-4 hover:scale-105 hover:shadow-lg 
                         transition cursor-pointer block"
            >
              <img
                src={
                  p.imagen_url && p.imagen_url.trim() !== ""
                    ? p.imagen_url
                    : `https://placehold.co/300x200?text=${encodeURIComponent(
                        p.nombre || "Producto"
                      )}`
                }
                alt={p.nombre}
                className="rounded-md w-full"
              />

              <h3 className="text-lg font-semibold mt-2 text-page">
                {p.nombre}
              </h3>

              {/* MOSTRAR PRECIO FINAL SI EXISTE */}
              {p.precio_final !== null && p.precio_final !== undefined && (
                <p className="text-brand-accent font-bold text-lg">
                  ${(p.precio_final).toLocaleString("es-CL")}
                </p>
              )}
              {/* BOTONES DE ADMIN */}
        {typeof window !== "undefined" && localStorage.getItem("usuario") && JSON.parse(localStorage.getItem("usuario")!).es_admin && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/producto/editar/${p.id}`;
              }}
              className="bg-yellow-500 text-black px-3 py-1 rounded"
            >
              Editar
            </button>

            <button
              onClick={async (e) => {
                e.preventDefault();
                if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

                await fetch(`https://musicpricehub.onrender.com/api/productos/${p.id}`, {
                  method: "DELETE",
                });

                alert("Producto eliminado");
                window.location.reload();
              }}
              className="bg-red-600 text-black px-3 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        )}
            </Link>
          ))}
        
        </div>
      )}
    </main>
  );
}
