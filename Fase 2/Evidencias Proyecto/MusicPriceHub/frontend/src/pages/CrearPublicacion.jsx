import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  crearPublicacionMercado,
  subirImagenesPublicacion,
} from "../services/api";
import { Guitar, Loader2 } from "lucide-react";

export default function CrearPublicacion() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImagenes(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setCargando(true);

      const pub = await crearPublicacionMercado({
        titulo,
        descripcion,
        precioCLP: precio,
        ciudad,
      });

      if (imagenes.length > 0) {
        await subirImagenesPublicacion(pub.id, imagenes);
      }

      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear la publicación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191a] text-[#e4e6eb] flex justify-center">
      <div className="w-full max-w-2xl py-8 px-4">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Guitar size={28} className="text-[#FBBF24]" />
            <div>
              <h1 className="text-xl font-bold">Publicar instrumento</h1>
              <p className="text-xs text-[#b0b3b8]">
                Crea un aviso para vender tu instrumento o equipo musical
              </p>
            </div>
          </div>

          <Link
            to="/marketplace"
            className="text-xs text-[#FBBF24] hover:text-[#F59E0B] transition"
          >
            ⬅ Volver al marketplace
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-[#242526] border border-[#3a3b3c] rounded-xl p-5 space-y-4"
        >
          {error && (
            <p className="text-sm text-red-400 bg-[#3b1f24] px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold">Título</label>
            <input
              type="text"
              required
              placeholder="Ej: Guitarra eléctrica Fender Stratocaster"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#3a3b3c] border border-transparent focus:border-emerald-500 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Descripción</label>
            <textarea
              rows={4}
              placeholder="Estado, detalles, qué incluye, etc."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#3a3b3c] border border-transparent focus:border-emerald-500 focus:outline-none text-sm resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Precio (CLP)</label>
              <input
                type="text"
                required
                placeholder="Ej: 350000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#3a3b3c] border border-transparent focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Ciudad</label>
              <input
                type="text"
                placeholder="Ej: Santiago"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#3a3b3c] border border-transparent focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Imágenes del producto{" "}
              <span className="ml-1 text-xs text-[#b0b3b8]">
                (puedes seleccionar varias)
              </span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="text-sm"
            />
            {imagenes.length > 0 && (
              <p className="text-xs text-[#b0b3b8]">
                {imagenes.length} archivo(s) seleccionado(s)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg py-2 text-sm font-semibold mt-2"
          >
            {cargando && <Loader2 size={16} className="animate-spin" />}
            <span>{cargando ? "Publicando..." : "Publicar instrumento"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
