"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {ChatWidget} from "../chat/chat";
type TemaForo = {
  id: string;
  titulo: string;
  creado_en: string;
  creador?: { nombre_publico?: string };
};

export default function ComunidadPage() {
  const [temas, setTemas] = useState<TemaForo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(
          "https://musicpricehub.onrender.com/comunidad/temas"
        );
        if (!res.ok) throw new Error("Error al obtener temas");

        const data = await res.json();
        setTemas(data);
      } catch (err) {
        setError("No se pudieron cargar los temas");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-white flex items-center justify-center">
        Cargando temas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white p-8">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-[#FBBF24]">
          Comunidad MusicPriceHub
        </h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {temas.length === 0 ? (
          <p className="text-gray-400">Aún no hay temas creados.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {temas.map((t) => (

              <Link
                key={t.id}
                href={`/comunidad/${t.id}`}
                className="block bg-[#111318] border border-[#1f242d] p-4 rounded-xl hover:bg-[#1a1d24] transition"
              >
                <h2 className="text-lg font-semibold text-[#FBBF24]">
                  {t.titulo}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {(new Date(t.creado_en).toLocaleString("es-CL", {
                    timeZone: "America/Santiago",
                  }))
                  }
                </p>

                <p className="text-xs text-[#FBBF24] mt-1">
                  {t.creador?.nombre_publico || "Usuario"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
