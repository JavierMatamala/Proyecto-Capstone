"use client";

import { useEffect, useState } from "react";

type Oferta = {
  precio_centavos: number;
};

type Producto = {
  id: number;
  nombre: string;
  imagen_url?: string;
  ofertas?: Oferta[];
};

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://musicpricehub.onrender.com/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch(() => setError("No se pudo conectar con la API."));
  }, []);

  return (
    <main className="p-6">

      <h2 className="text-3xl font-bold mb-6 text-brand-accent text-center">
        🎶 Productos disponibles
      </h2>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      {productos.length === 0 ? (
        <p className="text-page-soft text-center">No hay productos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-brand-card rounded-xl p-4 hover:scale-105 hover:shadow-lg transition cursor-pointer"
            >
              <img
                src={
                  p.imagen_url ??
                  `https://placehold.co/300x200?text=${encodeURIComponent(
                    p.nombre ?? "Producto"
                  )}`
                }
                alt={p.nombre}
                className="rounded-md w-full"
              />

              <h3 className="text-lg font-semibold mt-2 text-page">
                {p.nombre}
              </h3>

              {p.ofertas?.length ? (
                <p className="text-brand-accent font-bold text-lg">
                  ${p.ofertas[0].precio_centavos.toLocaleString("es-CL")}
                </p>
              ) : (
                <p className="text-page-soft">$ —</p>
              )}
            </div>
          ))}

        </div>
      )}
    </main>
  );
}
