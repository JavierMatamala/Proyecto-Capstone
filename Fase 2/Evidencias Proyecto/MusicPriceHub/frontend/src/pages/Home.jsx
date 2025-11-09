import { useEffect, useState } from "react";
import { getProductos } from "../services/api";
import { Search, User, Guitar } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getProductos()
      .then((data) => setProductos(data))
      .catch(() => setError("No se pudo conectar con la API."));
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#1E3A8A] shadow-md w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 ml-10">
          <Guitar size={32} color="#FBBF24" />
          <h1 className="text-2xl font-bold text-white">MusicPriceHub</h1>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center w-1/2 bg-white rounded-md overflow-hidden">
          <input
            type="text"
            placeholder="Buscar instrumentos o marcas..."
            className="w-full px-4 py-2 text-gray-700 outline-none"
          />
          <button className="bg-[#6D28D9] px-4 py-2 hover:bg-[#5B21B6] transition">
            <Search size={20} color="white" />
          </button>
        </div>

        {/* Perfil / Login */}
        <div className="flex items-center gap-4 mr-10">
          <Link
            to="/login"
            className="text-sm bg-[#FBBF24] text-black px-4 py-2 rounded hover:bg-[#F59E0B] transition"
          >
            Iniciar Sesión
          </Link>
          <User size={28} />
        </div>
      </header>

      {/* NAV */}
      <nav className="flex justify-center gap-10 py-3 bg-[#1E3A8A]/90 backdrop-blur-md w-full">
        <button className="hover:text-[#FBBF24] transition">Instrumentos</button>
        <button className="hover:text-[#FBBF24] transition">Accesorios</button>
        <button className="hover:text-[#FBBF24] transition">Ofertas</button>

        {/* 🔗 Enlace funcional a Comunidad */}
        <Link
          to="/comunidad"
          className="hover:text-[#FBBF24] transition font-semibold"
        >
          Comunidad
        </Link>

        <button className="hover:text-[#FBBF24] transition">Marketplace</button>
      </nav>

      {/* SECCIÓN PRINCIPAL */}
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-[#FBBF24] text-center">
          🎶 Productos disponibles
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        {productos.length === 0 ? (
          <p className="text-gray-400 text-center">
            No hay productos registrados por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((p) => (
              <div
                key={p.id}
                className="bg-[#1F2937] rounded-xl p-4 hover:scale-105 hover:shadow-lg transition"
              >
                <img
                  src={`https://via.placeholder.com/200x150?text=${encodeURIComponent(p.nombre)}`}
                  alt={p.nombre}
                  className="rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold">{p.nombre}</h3>
                <p className="text-gray-300">${p.precio}</p>
                <button className="mt-3 bg-[#6D28D9] hover:bg-[#5B21B6] text-white w-full py-2 rounded transition">
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
