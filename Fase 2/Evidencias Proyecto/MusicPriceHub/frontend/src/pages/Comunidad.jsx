// src/pages/Comunidad.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Send, User, Loader2 } from "lucide-react";

const API_URL = "https://musicpricehub.onrender.com"; // Ajusta si usas otra URL

function Comunidad() {
  const [temas, setTemas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [creando, setCreando] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const usuario = localStorage.getItem("usuario")
    ? JSON.parse(localStorage.getItem("usuario"))
    : null;

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const res = await fetch(`${API_URL}/comunidad/temas`);
        if (!res.ok) throw new Error("No se pudo obtener los temas");
        const data = await res.json();
        setTemas(data);
      } catch (err) {
        setError("No se pudieron cargar los temas de la comunidad.");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    fetchTemas();
  }, []);

  const handleCrearTema = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    if (!nuevoTitulo.trim()) return;

    try {
      setCreando(true);
      const res = await fetch(`${API_URL}/comunidad/temas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo: nuevoTitulo }),
      });

      if (!res.ok) {
        throw new Error("No se pudo crear el tema");
      }

      const temaCreado = await res.json();
      setTemas((prev) => [temaCreado, ...prev]);
      setNuevoTitulo("");
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el tema. Intenta más tarde.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white font-sans">
      {/* Header sencillo reutilizable */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#1E3A8A] shadow-md">
        <h1 className="text-2xl font-bold text-[#FBBF24]">Comunidad MusicPriceHub</h1>
        {usuario ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-200">
              Conectado como{" "}
              <span className="font-semibold text-[#FBBF24]">
                {usuario.nombre?.trim() || "usuario"}
              </span>
            </span>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm bg-[#FBBF24] text-black px-4 py-2 rounded hover:bg-[#F59E0B] transition"
          >
            Iniciar Sesión
          </button>
        )}
      </header>

      <main className="flex flex-col items-center py-10 px-4">
        <p className="text-gray-400 mb-8 text-center max-w-2xl">
          Publica tus dudas, comparte experiencias o pide consejos sobre instrumentos,
          tiendas o grabación. Explora los hilos y participa en la comunidad.
        </p>

        {/* Formulario nuevo tema */}
        <form
          onSubmit={handleCrearTema}
          className="w-full max-w-2xl bg-[#1E293B] p-6 rounded-2xl shadow-md border border-[#FBBF24]/30 mb-10"
        >
          <div className="flex items-start gap-3">
            <User className="text-[#FBBF24] mt-1" />
            <textarea
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
              placeholder={
                token
                  ? "Crea un nuevo tema para conversar con otros músicos..."
                  : "Inicia sesión para crear un tema."
              }
              disabled={!token}
              className="flex-1 bg-[#0f172a] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-[#FBBF24] resize-none disabled:opacity-60"
              rows="2"
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!token || creando}
              className="flex items-center gap-2 bg-[#FBBF24] text-black font-semibold px-4 py-2 rounded-md hover:bg-[#F59E0B] disabled:opacity-60 transition"
            >
              {creando ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Publicar tema
            </button>
          </div>
        </form>

        {/* Lista de temas */}
        <div className="w-full max-w-3xl">
          {cargando && (
            <div className="flex justify-center py-10 text-gray-300">
              <Loader2 className="animate-spin mr-2" /> Cargando temas...
            </div>
          )}

          {error && (
            <p className="text-center text-red-400 mb-4">
              {error}
            </p>
          )}

          {!cargando && temas.length === 0 && !error && (
            <p className="text-center text-gray-400">
              Aún no hay temas creados. Sé el primero en publicar.
            </p>
          )}

          <div className="flex flex-col gap-4">
          {temas.map((t) => (
            <Link
              key={t.id}
              to={`/comunidad/temas/${t.id}`}
              className="block bg-[#111827] hover:bg-[#1f2937] border border-[#FBBF24]/20 rounded-xl p-4 transition shadow-sm"
            >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white">{t.titulo}</h2>
                  <span className="text-xs text-gray-400">
                    {new Date(t.creado_en).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <MessageCircle size={14} />
                  <span>Ver conversación</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Comunidad;
