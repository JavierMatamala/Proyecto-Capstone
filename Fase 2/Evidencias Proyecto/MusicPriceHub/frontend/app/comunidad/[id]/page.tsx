"use client";

import TemaCard from "./components/TemaCard";
import RespuestaCard from "./components/RespuestaCard";
import CrearRespuesta from "./components/CrearRespuesta";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function TemaDetallePage() {
  const params = useParams();
  const temaId = params.id as string;
  console.log("ID DEL TEMA:", temaId);

  // ============================
  // ESTADOS PARA DATOS REALES
  // ============================
  const [temaReal, setTemaReal] = useState<any>(null);
  const [mensajesReal, setMensajesReal] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // ============================
  // FETCH REAL A LA API
  // ============================
  useEffect(() => {
    async function cargarDatos() {
      try {
        const res = await fetch(
          `https://musicpricehub.onrender.com/comunidad/temas/${temaId}/detalle-frontend`
        );
        const data = await res.json();
        console.log("DATOS DEL BACKEND:", data);

        setTemaReal(data.tema);
        setMensajesReal(data.mensajes);
      } catch (error) {
        console.error("Error cargando tema:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [temaId]);

  // ============================
  // MOCK (solo para pruebas)
  // ============================
  const temaMock = {
    id: "1",
    titulo: "¿Qué guitarra recomiendan para empezar?",
    contenido: "Estoy entre una Yamaha Pacifica y una Squier Affinity. ¿Cuál elegirían?",
    usuario: "marc_g",
    fecha: "2025-02-21",
  };

  const respuestasMock = [
    {
      id: "r1",
      usuario: "guitarrista_pro",
      contenido: "La Yamaha Pacifica 112 es excelente para empezar.",
      fecha: "2025-02-21 14:00",
    },
    {
      id: "r2",
      usuario: "musico_rock",
      contenido: "La Squier suena más vintage, depende del estilo.",
      fecha: "2025-02-21 15:20",
    }
  ];

  const [respuestas, setRespuestas] = useState(respuestasMock);

  const agregarRespuesta = (texto: string) => {
    const nueva = {
      id: crypto.randomUUID(),
      usuario: "usuario_actual",
      contenido: texto,
      fecha: new Date().toLocaleString(),
    };
    setRespuestas([...respuestas, nueva]);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-[#0b0d11] pt-24 px-4">
      <div className="max-w-4xl mx-auto">

    {/* TEMPORAL: Mostrar mock mientras no usamos datos reales */}
      <TemaCard tema={temaMock} />

        <h2 className="text-xl font-semibold text-page mt-8 mb-4">
          Respuestas ({respuestas.length})
        </h2>

        <div className="flex flex-col gap-4">
          {respuestas.map((r) => (
            <RespuestaCard key={r.id} respuesta={r} />
          ))}
        </div>

        <div className="mt-8">
          <CrearRespuesta onSubmit={agregarRespuesta} />
        </div>

      </div>
    </div>
  );
}
