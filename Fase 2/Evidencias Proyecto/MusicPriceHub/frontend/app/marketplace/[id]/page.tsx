"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Gallery from "../components/Gallery";
import ChatButton from "../components/ChatButton";
import { ArrowLeft, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import {ChatWidget} from "../../chat/chat";
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
  vendedor: any;
  imagenes?: Imagen[];
};

export default function PublicacionDetallePage() {
  const { id } = useParams();
  const [pub, setPub] = useState<Publicacion | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Cargar publicación individual
  useEffect(() => {
    if (!id) return;

    fetch(`https://musicpricehub.onrender.com/mercado/publicaciones/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPub(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar la publicación.");
        setLoading(false);
      });
  }, [id]);


  if (loading) {
    return (
      <div className="p-6 text-center text-page-soft">
        Cargando publicación...
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="p-6 text-center text-red-400">
        Error: {error || "Publicación no encontrada."}
      </div>
    );
  }
  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">

      {/* VOLVER */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-brand-accent hover:underline mb-4"
      >
        <ArrowLeft size={18} />
        Volver al Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">

        {/* GALERÍA DE IMÁGENES */}
        <div>
          <Gallery
            images={
              pub.imagenes?.length
                ? pub.imagenes.map((i) => i.url_imagen)
                : ["https://placehold.co/800x600?text=Sin+imagen"]
            }
          />
        </div>

        {/* INFORMACIÓN DEL PRODUCTO */}
        <div className="flex flex-col justify-between">

          {/* Título */}
          <h1 className="text-3xl font-bold text-brand-accent mb-4">
            {pub.titulo}
          </h1>

          {/* Precio */}
          <p className="text-3xl font-bold text-page mb-2 flex items-center gap-2">
            <DollarSign size={26} className="text-brand-accent" />
            {(pub?.precio_centavos).toLocaleString("es-CL")}
            <span className="text-xl">{pub.moneda}</span>
          </p>

          {/* Ciudad */}
          {pub.ciudad && (
            <p className="flex items-center gap-2 text-page-soft mb-4">
              <MapPin size={18} />
              {pub.ciudad}
            </p>
          )}

          {/* Descripción */}
          <div className="mt-6 bg-brand-card p-4 rounded-xl shadow">
            <h2 className="font-semibold text-lg mb-2">Descripción</h2>
            <p className="text-page-soft leading-relaxed">
              {pub.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          {/* Fecha */}
          <p className="text-xs text-page-soft mt-6">
            Publicado el: {new Date(pub.creada_en).toLocaleDateString("es-CL")}
          </p>
          <ChatButton
            vendedorId={pub.vendedor.id}
            vendedor={pub.vendedor}
            publicacionNombre={pub.titulo}
            publicacionId={pub.id}
          />
        </div>
      </div>
    <ChatWidget />
    </div>
  );
}
