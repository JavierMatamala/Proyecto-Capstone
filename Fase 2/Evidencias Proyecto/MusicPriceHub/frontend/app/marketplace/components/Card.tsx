"use client";

import Link from "next/link";
import { MapPin, Heart } from "lucide-react";

export default function Card({ item }: { item: any }) {
  const imagen =
    item.imagenes?.[0]?.url_imagen ??
    item.imagen_principal ??
    "https://placehold.co/600x400?text=Sin+Imagen";

  const precio = (item.precio_centavos / 100).toLocaleString("es-CL");

  return (
    <Link
      href={`/marketplace/${item.id}`}
      className="
        relative
        block 
        bg-[#0F1115] 
        rounded-2xl 
        shadow-lg 
        overflow-hidden 
        border border-[#1f242d]
        transition-all 
        hover:scale-[1.02]
        hover:border-brand-accent
        hover:shadow-[0_0_25px_-8px_rgba(251,191,36,0.45)]
      "
    >
      {/* ICONO FAVORITOS */}
      <div
        className="
          absolute top-3 right-3 
          bg-black/50 backdrop-blur-sm 
          p-2 rounded-full 
          text-brand-accent
          hover:bg-black/70 
          transition
        "
      >
        <Heart className="w-5 h-5" />
      </div>

      {/* IMAGEN */}
      <div className="w-full h-52 bg-black/20 overflow-hidden">
        <img
          src={imagen}
          alt={item.titulo}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
      </div>

      {/* CONTENIDO */}
      <div className="p-4 text-page">
        {/* TITULO */}
        <h3 className="text-xl font-semibold mb-1 line-clamp-1">
          {item.titulo}
        </h3>

        {/* PRECIO */}
        <p className="text-brand-accent text-2xl font-bold mb-3">
          ${precio}
        </p>

        {/* CIUDAD */}
        {item.ciudad && (
          <p className="flex items-center text-sm text-page-soft mb-4">
            <MapPin className="h-4 w-4 mr-2 text-brand-accent" />
            {item.ciudad}
          </p>
        )}

        {/* BOTON VER MAS */}
        <button
          className="
            w-full py-2 
            bg-brand-accent 
            text-[#020617] 
            rounded-xl 
            font-semibold 
            transition-all 
            hover:bg-[#e5ac22]
          "
        >
          Ver publicación
        </button>
      </div>
    </Link>
  );
}
