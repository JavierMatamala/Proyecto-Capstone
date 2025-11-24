// src/pages/TemaDetalle.jsx
import React, { useEffect, useState, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  User,
  Loader2,
  Reply,
  Send,
} from "lucide-react";

const API_URL = "https://musicpricehub.onrender.com";

/* ------------------------------ TIME AGO -------------------------------- */
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  if (hr < 24) return `hace ${hr} h`;
  if (day < 30) return `hace ${day} días`;
  const months = Math.floor(day / 30);
  if (months < 12) return `hace ${months} mes(es)`;
  return `hace ${Math.floor(months / 12)} año(s)`;
}

/* ------------------------------ AVATAR -------------------------------- */
function Avatar({ usuario }) {
  const nombre = usuario?.nombre_publico || "Usuario";
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  if (usuario?.avatar_url) {
    return (
      <img
        src={usuario.avatar_url}
        alt={nombre}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xs font-bold text-[#FBBF24]">
      {iniciales || "U"}
    </div>
  );
}

/* ======================================================================== */
/*                           COMPONENTE PRINCIPAL                            */
/* ======================================================================== */

function TemaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [accionCargando, setAccionCargando] = useState(null);
  const [respondiendoA, setRespondiendoA] = useState(null);

  const [colapsados, setColapsados] = useState({});
  const token = localStorage.getItem("access_token");

  /** 🔥 Nuevo estado para comentario raíz */
  const [textoRespuestaRoot, setTextoRespuestaRoot] = useState("");

  /* ------------------------------ CARGAR DETALLE ------------------------------ */
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setCargando(true);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(
          `${API_URL}/comunidad/temas/${id}/detalle-frontend`,
          { headers }
        );
        if (!res.ok) throw new Error("No se pudo cargar el tema.");

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la conversación.");
      } finally {
        setCargando(false);
      }
    };

    fetchDetalle();
  }, [id, token]);

  const mensajesMapa = data?.mensajes?.mapa || {};
  const raices = data?.mensajes?.raices || [];

  /* ------------------------------ RECARGAR ------------------------------ */
  const recargar = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `${API_URL}/comunidad/temas/${id}/detalle-frontend`,
        { headers }
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------ LIKE TOGGLE ------------------------------ */
  const handleLikeToggle = async (mensajeId, meGustaActual) => {
    if (!token) return navigate("/login");

    try {
      setAccionCargando(mensajeId);

      const res = await fetch(
        `${API_URL}/comunidad/mensajes/${mensajeId}/like`,
        {
          method: meGustaActual ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error en like");
      await recargar();
    } catch (err) {
      console.error(err);
    } finally {
      setAccionCargando(null);
    }
  };

  /* ------------------------------ ENVIAR RESPUESTA ------------------------------ */
  const handleEnviarRespuesta = async (mensajeId, texto, clearFn) => {
    if (!token) return navigate("/login");
    if (!texto.trim()) return;

    try {
      setAccionCargando(mensajeId || "root");

      const res = await fetch(
        `${API_URL}/comunidad/temas/${id}/mensajes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contenido: texto,
            respuesta_a_id: mensajeId || null,
          }),
        }
      );

      if (!res.ok) throw new Error("No se pudo enviar respuesta");

      clearFn("");
      setRespondiendoA(null);
      await recargar();
    } catch (err) {
      console.error(err);
    } finally {
      setAccionCargando(null);
    }
  };

  /* ------------------------------ COLAPSAR ------------------------------ */
  const toggleColapsado = (mensajeId) => {
    setColapsados((prev) => ({
      ...prev,
      [mensajeId]: !prev[mensajeId],
    }));
  };

  /* ======================================================================== */
  /*                   COMPONENTE COMENTARIO (OPTIMIZADO)                     */
  /* ======================================================================== */

  const Comentario = memo(({ mensajeId }) => {
    const m = mensajesMapa[mensajeId];
    if (!m) return null;

    const nivel = m.nivel || 0;
    const tieneRespuestas = (m.respuestas || []).length > 0;
    const colapsado = colapsados[mensajeId];

    const [textoRespuesta, setTextoRespuesta] = useState("");

    return (
      <div className="flex">
        <div
          className={`mr-2 ${nivel ? "border-l border-gray-700 ml-2" : ""}`}
        ></div>

        <div
          className="flex-1 mb-3 bg-[#020617] border border-gray-800 rounded-lg p-3"
        >
          {/* CABECERA */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Avatar usuario={m.usuario} />
              <span className="text-sm font-semibold text-[#FBBF24]">
                {m.usuario?.nombre_publico || "Usuario"}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(m.creado_en)}
              </span>
            </div>

            {tieneRespuestas && (
              <button
                type="button"
                onClick={() => toggleColapsado(mensajeId)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
              >
                {colapsado ? (
                  <>
                    <ChevronRight size={14} />
                    <span>Mostrar</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>Ocultar</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* CONTENIDO */}
          <p className="text-sm mb-2">{m.contenido}</p>

          {/* ACCIONES */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">

            <button
              type="button"
              onClick={() => handleLikeToggle(mensajeId, m.me_gusta)}
              disabled={accionCargando === mensajeId}
              className="flex items-center gap-1 hover:text-[#FBBF24]"
            >
              <Heart
                size={14}
                className={m.me_gusta ? "fill-[#FBBF24] text-[#FBBF24]" : ""}
              />
              <span>{m.likes}</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#FBBF24]"
              onClick={() => setRespondiendoA(mensajeId)}
            >
              <Reply size={14} /> Responder
            </button>

            {tieneRespuestas && (
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>{m.cantidad_respuestas}</span>
              </div>
            )}
          </div>

          {/* FORMULARIO DE RESPUESTA */}
          {respondiendoA === mensajeId && (
            <form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleEnviarRespuesta(
                  mensajeId,
                  textoRespuesta,
                  setTextoRespuesta
                );
              }}
            >
              <textarea
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                rows={3}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-[#020617] border border-gray-700 rounded-md p-2 text-sm text-white"
              />

              <div className="flex justify-end mt-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRespondiendoA(null)}
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={accionCargando === mensajeId}
                  className="flex items-center gap-1 bg-[#FBBF24] text-black px-3 py-1 rounded-md text-xs hover:bg-[#F59E0B]"
                >
                  {accionCargando === mensajeId ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Send size={14} />
                  )}
                  Enviar
                </button>
              </div>
            </form>
          )}

          {/* RESPUESTAS RECURSIVAS */}
          {!colapsado &&
            (m.respuestas || []).map((hijoId) => (
              <Comentario key={hijoId} mensajeId={hijoId} />
            ))}
        </div>
      </div>
    );
  });

  /* ======================================================================== */
  /* UI PRINCIPAL */
  /* ======================================================================== */

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Cargando conversación...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-3">{error}</p>
        <button
          onClick={() => navigate("/comunidad")}
          className="text-sm text-[#FBBF24] hover:text-[#F59E0B] flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    );
  }

  const tema = data.tema;

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* CABECERA */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => navigate("/comunidad")}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft size={18} /> Volver a la comunidad
        </button>

        <span className="text-xs text-gray-500">
          Tema creado {timeAgo(tema.creado_en)}
        </span>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-4xl mx-auto py-6 px-4">

        <h1 className="text-2xl font-bold mb-4 text-[#FBBF24]">
          {tema.titulo}
        </h1>

        {/* CREAR PRIMER MENSAJE */}
        <section className="mt-6">
          <h2 className="text-sm text-gray-400 mb-2">
            Escribe el primer comentario
          </h2>

          {token ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnviarRespuesta(
                  null,
                  textoRespuestaRoot,
                  setTextoRespuestaRoot
                );
              }}
            >
              <textarea
                value={textoRespuestaRoot}
                onChange={(e) => setTextoRespuestaRoot(e.target.value)}
                rows={3}
                className="w-full bg-[#020617] border border-gray-700 rounded-md p-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#FBBF24]"
                placeholder="Escribe algo para iniciar la conversación..."
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={accionCargando === "root"}
                  className="flex items-center gap-1 bg-[#FBBF24] text-black px-3 py-1 rounded-md text-xs hover:bg-[#F59E0B] disabled:opacity-60"
                >
                  Enviar
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-400 text-sm">
              Debes{" "}
              <a href="/login" className="text-[#FBBF24] hover:underline">
                iniciar sesión
              </a>{" "}
              para comentar.
            </p>
          )}
        </section>

        {/* LISTA DE MENSAJES */}
        <section className="mt-4">
          {raices.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Aún no hay mensajes.
            </p>
          ) : (
            raices.map((rid) => (
              <Comentario key={rid} mensajeId={rid} />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default TemaDetalle;
