"use client";

import { useEffect, useState } from "react";
import ProductCard from "./components/Card";
import Filters from "./components/Filters";
import SkeletonCard from "./components/SkeletonCard";
import {ChatWidget} from "../chat/chat";

// Tipos según tu API
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
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroMin, setFiltroMin] = useState(null);
  const [filtroMax, setFiltroMax] = useState(null);
  const [filtroOrden, setFiltroOrden] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/mercado/publicaciones")
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
    <div className="px-4 py-6 max-w-7xl mx-auto">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold mb-6 text-brand-accent">
        🛒 Marketplace
      </h1>

      {/* FILTROS */}
      <Filters onChange={(filtros) => aplicarFiltro(filtros)} />

      {/* ERROR */}
      {error && (
        <p className="text-red-400 text-center mt-4">{error}</p>
      )}

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">

        {/* Mientras carga → Skeletons */}
        {cargando &&
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}

        {/* Si ya cargó */}
        {!cargando &&
          publicacionesFiltradas.map((pub) => (
            <ProductCard
                key={pub.id}
                item={{
                    id: pub.id,
                    titulo: pub.titulo,
                    precio_centavos: pub.precio_centavos,
                    ciudad: pub.ciudad,
                    imagen:
                        pub.imagenes?.length
                            ? pub.imagenes[0].url_imagen
                            : "https://placeholder.co/600x400?text=Sin+imagen",
                }}
            />

          ))}

        {/* No hay resultados */}
        {!cargando && publicacionesFiltradas.length === 0 && (
          <p className="col-span-full text-center text-page-soft">
            No se encontraron publicaciones.
          </p>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
