/*"use client";

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

        {/* TEMPORAL: Mostrar mock mientras no usamos datos reales */
   /*     <TemaCard tema={temaMock} />

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
*/



"use client";

import TemaCard from "./components/TemaCard";
import RespuestaCard from "./components/RespuestaCard";
import CrearRespuesta from "./components/CrearRespuesta";

import { useState } from "react";
import { useParams } from "next/navigation";

// ==========================================================
// DATOS REALES MOCK (hasta conectar API)
// ==========================================================
const datosRealesMock = {
  tema: {
    id: "54fc55f4-5cd4-4346-8f2f-95719fe29c5e",
    titulo: "¿Qué guitarra recomiendan para empezar?",
    contenido: "Estoy entre una Yamaha Pacifica y una Squier Affinity. ¿Cuál elegirían?",
    usuario: "marc_g",
    categoria_id: "2b2efec3-f973-407f-a5dc-adec08172a5d",
    creado_en: "2025-11-17T06:29:50.247668+00:00",
    actualizado_en: "2025-11-18T01:34:21.558597+00:00",
    fijado: false,
    cerrado: false
  },
  mensajes: {
    raices: [
      "e004e968-8486-4c3d-9ee7-164347cbc4db",
      "073621c1-20ea-4bd2-a058-28c5a142f465"
    ],
    mapa: {
      "e004e968-8486-4c3d-9ee7-164347cbc4db": {
        id: "e004e968-8486-4c3d-9ee7-164347cbc4db",
        usuario: { nombre_publico: "Juan Perez" },
        contenido: "Corrección: la Yamaha F310 es ideal si buscas buena relación precio/calidad.",
        creado_en: "2025-11-17T06:35:23",
        nivel: 0,
        respuestas: ["a3749196-f012-4401-bf8a-de93d89d9e28", "76c73e64-70ad-4491-8421-5800ac881d2c"],
        eliminado: false
      },
      "a3749196-f012-4401-bf8a-de93d89d9e28": {
        id: "a3749196-f012-4401-bf8a-de93d89d9e28",
        usuario: { nombre_publico: "Juan Perez" },
        contenido: "[mensaje eliminado]",
        creado_en: "2025-11-17T06:38:01",
        nivel: 1,
        respuestas: [],
        eliminado: true
      },
      "76c73e64-70ad-4491-8421-5800ac881d2c": {
        id: "76c73e64-70ad-4491-8421-5800ac881d2c",
        usuario: { nombre_publico: "prueba" },
        contenido: "p",
        creado_en: "2025-11-18T00:12:18",
        nivel: 1,
        respuestas: ["9e3dc2f4-ec9a-4cc8-b25c-250e7bd2bda4"],
        eliminado: false
      }
    }
  }
};

// ==========================================================
// CONVERTIR ÁRBOL EN LISTA PARA RENDER
// ==========================================================
function construirListaPorNiveles(mensajes: any) {
  const listaFinal: any[] = [];

  function procesar(id: string) {
    const msg = mensajes.mapa[id];
    if (!msg) return;

    listaFinal.push(msg);

    msg.respuestas.forEach((rid: string) => procesar(rid));
  }

  mensajes.raices.forEach((rid: string) => procesar(rid));

  return listaFinal;
}

// ==========================================================
// COMPONENTE PRINCIPAL
// ==========================================================
export default function TemaDetallePage() {
  const params = useParams();
  const temaId = params.id;
  console.log("ID tema:", temaId);

  const mensajesOrdenados = construirListaPorNiveles(datosRealesMock.mensajes);

  return (
    <div className="min-h-screen bg-[#0b0d11] pt-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* TEMA */}
        <TemaCard
          tema={{
            titulo: datosRealesMock.tema.titulo,
            contenido: datosRealesMock.tema.contenido,
            usuario: datosRealesMock.tema.usuario,
            fecha: datosRealesMock.tema.creado_en
          }}
        />

        {/* TÍTULO RESPUESTAS */}
        <h2 className="text-xl font-semibold text-page mt-8 mb-4">
          Respuestas ({mensajesOrdenados.length})
        </h2>

        {/* RESPUESTAS */}
        <div className="flex flex-col gap-3">
          {mensajesOrdenados.map((msg) => (
            <div key={msg.id} style={{ marginLeft: msg.nivel * 28 }}>
              <RespuestaCard respuesta={msg} />
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div className="mt-8">
          <CrearRespuesta onSubmit={() => { }} />
        </div>

      </div>
    </div>
  );
}
