import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";   // ← AÑADIDO
import {
  MapPin,
  User,
  Guitar,
  Search,
  Filter,
  PlusCircle,
} from "lucide-react";
import { getPublicacionesMercado } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL ?? "https://musicpricehub.onrender.com";

function formatPrecioCLP(centavos) {
  const valor = (centavos || 0) / 100;
  return valor.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

export default function Marketplace() {
  const navigate = useNavigate(); // ← AÑADIDO

  const [publicaciones, setPublicaciones] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estaLogueado, setEstaLogueado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setEstaLogueado(!!token);
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async (filtros = {}) => {
    try {
      setCargando(true);
      const data = await getPublicacionesMercado(filtros);
      setPublicaciones(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las publicaciones del marketplace.");
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarPublicaciones({
      q: busqueda || undefined,
      ciudad: ciudad || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#18191a] text-[#e4e6eb]">

      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-3 border-b border-[#3a3b3c] bg-[#242526]">
        <div className="flex items-center gap-3">
          <Guitar size={30} className="text-[#FBBF24]" />
          <div>
            <h1 className="text-xl font-bold">Marketplace</h1>
            <p className="text-xs text-[#b0b3b8]">
              Compra y vende instrumentos entre músicos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {estaLogueado ? (
            <Link
              to="/marketplace/publicar"
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-semibold"
            >
              <PlusCircle size={16} />
              <span>Publicar instrumento</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs text-[#FBBF24] hover:text-[#F59E0B] transition max-w-[220px] text-right"
            >
              Si deseas publicar tu instrumento, inicia sesión
            </Link>
          )}

          <Link
            to="/"
            className="text-xs text-[#FBBF24] hover:text-[#F59E0B] transition"
          >
            ⬅ Volver al inicio
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 py-6 px-6">

        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-[#242526] rounded-xl p-4 gap-4 border border-[#3a3b3c]">
          <button className="flex items-center gap-2 text-sm font-semibold py-2 px-2 rounded-lg hover:bg-[#3a3b3c]">
            <Guitar size={18} />
            <span>Explorar instrumentos</span>
          </button>

          <button className="flex items-center gap-2 text-sm py-2 px-2 rounded-lg hover:bg-[#3a3b3c]">
            <Filter size={18} />
            <span>Filtros</span>
          </button>

          <div className="border-t border-[#3a3b3b] pt-3 mt-1 text-xs text-[#b0b3b8]">
            <p className="font-semibold mb-2">Categorías rápidas</p>
            <ul className="space-y-1">
              <li className="hover:text-white cursor-pointer">Guitarras</li>
              <li className="hover:text-white cursor-pointer">Bajos</li>
              <li className="hover:text-white cursor-pointer">Baterías</li>
              <li className="hover:text-white cursor-pointer">Teclados</li>
              <li className="hover:text-white cursor-pointer">Accesorios</li>
            </ul>
          </div>

          {estaLogueado ? (
            <Link
              to="/marketplace/publicar"
              className="mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg py-2 text-sm font-semibold"
            >
              <PlusCircle size={18} />
              <span>Publicar un instrumento</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="mt-2 text-xs text-[#FBBF24] hover:text-[#F59E0B] text-center"
            >
              Si deseas publicar tu instrumento, inicia sesión
            </Link>
          )}
        </aside>

        {/* COLUMNA DERECHA */}
        <main className="flex-1 flex flex-col gap-4">

          {/* BUSCADOR */}
          <section className="bg-[#242526] rounded-xl p-3 border border-[#3a3b3c]">
            <form
              onSubmit={handleBuscar}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
              <div className="flex-1 flex items-center gap-2 bg-[#3a3b3c] rounded-full px-3 py-2">
                <Search size={18} className="text-[#b0b3b8]" />
                <input
                  type="text"
                  placeholder="Buscar por instrumento, marca o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#b0b3b8]"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#3a3b3b] rounded-full px-3 py-2">
                <MapPin size={18} className="text-[#b0b3b8]" />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#b0b3b8]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-semibold"
              >
                Buscar
              </button>
            </form>
          </section>

          {/* GRID DE PUBLICACIONES */}
          <section>
            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

            {cargando ? (
              <p className="text-[#b0b3b8] text-sm">Cargando publicaciones...</p>
            ) : publicaciones.length === 0 ? (
              <p className="text-[#b0b3b8] text-sm">
                Aún no hay publicaciones en el marketplace.
              </p>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-3">
                  Publicaciones recientes
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 justify-start">
                  {publicaciones.map((pub) => {
                    const imgSrc = pub.imagen_principal
                    ? `${API_URL}${pub.imagen_principal}`
                    : `https://via.placeholder.com/400x300?text=${encodeURIComponent(pub.titulo)}`;

                    return (
                      <article
                        key={pub.id}
                        onClick={() =>
                          navigate(`/marketplace/publicacion/${pub.id}`) // ← AÑADIDO
                        }
                        className="max-w-[240px] bg-[#242526] rounded-lg overflow-hidden border border-[#3a3b3c] hover:border-[#FBBF24] transition cursor-pointer shadow-sm"
                      >
                        <div className="w-full aspect-[3/2] bg-black">
                          <img
                            src={imgSrc}
                            alt={pub.titulo}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        <div className="p-3 space-y-1">
                          <p className="text-sm font-semibold">
                            {formatPrecioCLP(pub.precio_centavos)}
                          </p>

                          <p className="text-xs text-[#e4e6eb] line-clamp-2">
                            {pub.titulo}
                          </p>

                          <p className="text-xs text-[#b0b3b8] flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{pub.ciudad || "Sin ciudad"}</span>
                          </p>

                          <p className="text-[11px] text-[#b0b3b8] flex items-center gap-1">
                            <User size={11} />
                            <span>
                              {pub.vendedor_nombre ||
                                "Vendedor sin nombre público"}
                            </span>
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
