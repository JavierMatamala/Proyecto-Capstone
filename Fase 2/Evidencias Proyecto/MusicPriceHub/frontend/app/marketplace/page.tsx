"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./components/Card";
import Filters from "./components/Filters";
import SkeletonCard from "./components/SkeletonCard";
import {ChatWidget} from "../chat/chat";

// Tipos según API
type Imagen = {
  url_imagen: string;
  orden: number;
};

type Publicacion = {
  id: string;
  titulo: string;
  descripcion: string;
  precio_centavos: number;
  moneda: string;
  ciudad?: string;
  creada_en: string;
  vendedor_id: string;
  imagenes?: Imagen[];
};

export default function MarketplacePage() {
  const router = useRouter();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroMin, setFiltroMin] = useState(null);
  const [filtroMax, setFiltroMax] = useState(null);
  const [filtroOrden, setFiltroOrden] = useState("");

  useEffect(() => {
    fetch("https://musicpricehub.onrender.com/mercado/publicaciones")
      .then((res) => res.json())
      .then((data) => {
        setPublicaciones(data);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudo conectar con la API del Marketplace.");
        setCargando(false);
      });
  }, []);

  const aplicarFiltro = (filtro:any) => {
    setFiltroTexto(filtro.texto || "");
    setFiltroMin(filtro.precioMin || null);
    setFiltroMax(filtro.precioMax || null);
    setFiltroOrden(filtro.orden || "");
  };

  const publicacionesFiltradas = publicaciones
  .filter(pub => {

    if (filtroTexto && filtroTexto !== "") {
      if (!pub.titulo.toLowerCase().includes(filtroTexto.toLowerCase())) {
        return false;
      }
    }
    
    if (filtroMin != null) {
      if (pub.precio_centavos < filtroMin) return false;

    }

    if (filtroMax != null) {
      if (pub.precio_centavos > filtroMax) return false;
    }
    return true;
  })
  if (filtroOrden === "precio_asc") {
      publicaciones.sort((a, b) => a.precio_centavos - b.precio_centavos);
    } else if (filtroOrden === "precio_desc") {
      publicaciones.sort((a, b) => b.precio_centavos - a.precio_centavos);
    }

return (
  <main className="max-w-7xl mx-auto px-4 py-6">
    {/* Fila 1: título + botón */}
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <span role="img" aria-label="cart">
          🛒
        </span>
        Marketplace
      </h1>

      <button
        onClick={() => router.push("/marketplace/crear")}
        className="px-4 py-2 rounded bg-brand-accent text-black font-semibold hover:bg-brand-accent/90"
      >
        Crear publicación
      </button>
    </div>

    {/* Fila 2: sidebar + contenido */}
    <div className="flex gap-6 items-start">
      {/* Sidebar más angosto, pegado a la izquierda */}
      <aside className="w-64 bg-[#020617] rounded-lg p-4 border border-brand-accent-soft/40 shrink-0">
        <Filters onChange={(filtros) => aplicarFiltro(filtros)} />
      </aside>

      {/* Contenido principal con más ancho */}
      <section className="flex-1">
        {error && (
          <p className="mb-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cargando &&
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}

          {!cargando &&
            publicacionesFiltradas.map((pub) => (
              <ProductCard
                key={pub.id}
                item={{
                  ...pub,
                  imagen_principal:
                    (pub as any).imagen_principal ??
                    (pub.imagenes?.[0]?.url_imagen ?? null),
                }}
              />
            ))}
        </div>

        {!cargando && publicacionesFiltradas.length === 0 && (
          <p className="mt-4 text-sm text-page-soft">
            No se encontraron publicaciones.
          </p>
        )}
      </section>
    </div>

    <ChatWidget />
  </main>
);
}