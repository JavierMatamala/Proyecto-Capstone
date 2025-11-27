"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import TemaCard from "./components/TemaCard";
import RespuestaCard from "./components/RespuestaCard";
import CrearRespuesta from "./components/CrearRespuesta";
import ModalReportar from "./components/ModalReportar";

// ===============================
// Función auxiliar
// ===============================
function bool(x: any) {
  if (x === true) return true;
  if (x === false) return false;
  if (x === "true") return true;
  if (x === "false") return false;
  return false;
}

// ===============================
// Componente principal
// ===============================
export default function TemaDetallePage() {
  const params = useParams();
  const temaId = params.id as string;

  const [tema, setTema] = useState<any | null>(null);
  const [mensajes, setMensajes] = useState<any | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [responderA, setResponderA] = useState<string | null>(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");

  // NUEVO: reporte
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeAReportar, setMensajeAReportar] = useState<string | null>(null);

  // ============================
  // FUNCIÓN — ENVIAR REPORTE
  // ============================
  async function enviarReporte(motivo: string) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Debes iniciar sesión.");
      return;
    }

    const res = await fetch(
      `http://localhost:8000/comunidad/mensajes/${mensajeAReportar}/reportes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo }),
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      alert("Error al enviar reporte.");
      return;
    }

    alert("Reporte enviado correctamente.");
    setModalVisible(false);
  }

  // ============================
  // FUNCIÓN — LIKE / UNLIKE
  // ============================
  async function toggleLike(mensajeId: string, yaTieneLike: boolean) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Debes iniciar sesión para dar like.");
      return;
    }

    const metodo = yaTieneLike ? "DELETE" : "POST";

    try {
      const res = await fetch(
        `http://localhost:8000/comunidad/mensajes/${mensajeId}/like`,
        {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.warn("Error al actualizar like:", err);
        return;
      }

      const data = await fetch(
        `http://localhost:8000/comunidad/temas/${temaId}/detalle-frontend`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((r) => r.json());

      setMensajes(data.mensajes);

    } catch (err) {
      console.error("Error al procesar like:", err);
    }
  }

  // ============================
  // FUNCIÓN — ENVIAR RESPUESTA
  // ============================
  async function enviarRespuesta(texto: string, respuestaA: string | null) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Debes iniciar sesión para responder.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/comunidad/temas/${temaId}/mensajes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contenido: texto,
            respuesta_a_id: respuestaA,
          }),
        }
      );

      if (!res.ok) return alert("Error al enviar respuesta");

      const data = await fetch(
        `http://localhost:8000/comunidad/temas/${temaId}/detalle-frontend`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((r) => r.json());

      setTema(data.tema);
      setMensajes(data.mensajes);

      setResponderA(null);
      setTextoRespuesta("");

    } catch (error) {
      console.error(error);
    }
  }

  // ============================
  // Cargar datos reales de la API
  // ============================
  useEffect(() => {
    if (!temaId) return;

    const cargarDatos = async () => {
      try {
        setCargando(true);

        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `http://localhost:8000/comunidad/temas/${temaId}/detalle-frontend`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("No se pudo cargar el tema");

        const data = await res.json();

        setTema(data.tema);
        setMensajes(data.mensajes);

      } catch (err) {
        console.error(err);
        setError("Error al cargar el tema");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [temaId]);

  const mensajesOrdenados =
    mensajes ? construirListaPorNiveles(mensajes) : [];

  // ============================
  // Render
  // ============================
  return (
    <div className="min-h-screen bg-[#0b0d11] pt-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* TEMA */}
        <TemaCard
          tema={{
            titulo: tema?.titulo,
            contenido: tema?.contenido ?? "",
            usuario:
              tema?.creador?.nombre_publico ||
              tema?.usuario?.nombre_publico ||
              tema?.usuario ||
              "Usuario",
            fecha: tema?.creado_en,
          }}
        />

        <h2 className="text-xl font-semibold text-page mt-8 mb-4">
          Respuestas ({mensajesOrdenados.length})
        </h2>

        {/* RESPUESTAS */}
        <div className="flex flex-col gap-3">
          {mensajesOrdenados.map((msg: any) => (
            <div key={msg.id} style={{ marginLeft: msg.nivel * 28 }}>
              <RespuestaCard
                respuesta={msg}
                onResponder={(id: string) => setResponderA(id)}
                onLike={() => toggleLike(msg.id, bool(msg.me_gusta))}
                onReport={() => {
                  setMensajeAReportar(msg.id);
                  setModalVisible(true);
                }}
              />
            </div>
          ))}
        </div>

        {/* FORM RESPUESTA */}
        <div className="mt-8">
          <CrearRespuesta
            onSubmit={(texto: string) => enviarRespuesta(texto, null)}
          />
        </div>
      </div>

      {/* MODAL REPORTAR */}
      <ModalReportar
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={enviarReporte}
      />

    </div>
  );
}

// ===============================
// Función para “aplanar” el árbol
// ===============================
function construirListaPorNiveles(mensajes: any): any[] {
  const listaFinal: any[] = [];

  function procesar(id: string) {
    const msg = mensajes.mapa[id];
    if (!msg) return;

    listaFinal.push(msg);
    (msg.respuestas || []).forEach((rid: string) => procesar(rid));
  }

  mensajes.raices.forEach((rid: string) => procesar(rid));

  return listaFinal;
}
