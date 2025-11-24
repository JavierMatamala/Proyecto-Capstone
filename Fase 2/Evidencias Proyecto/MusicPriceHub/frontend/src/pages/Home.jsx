import { useEffect, useState } from "react";
import { getProductos } from "../services/api";
import { Search, User, Guitar, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
function Home() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  // ✅ Al cargar la página, traer productos y usuario si existe
  useEffect(() => {
    getProductos()
      .then((data) => setProductos(data))
      .catch(() => setError("No se pudo conectar con la API."));

    // Leer usuario guardado del localStorage
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("access_token");
    setUsuario(null);
    navigate("/");
  };

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

        {/* Perfil / Sesión */}
<div className="flex items-center gap-4 mr-10">
{usuario ? (
  <div className="flex items-center gap-3">
    <p className="text-[#FBBF24] font-semibold">
      Hola, {usuario.nombre?.trim() || "usuario"} 👋
    </p>
    <button
      onClick={() => navigate("/perfil")}
      className="p-1 rounded-full hover:bg-[#FBBF24]/20 transition"
      title="Ver perfil"
    >
      <User size={28} color="white" />
    </button>
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
    >
      <LogOut size={16} /> Cerrar sesión
    </button>
  </div>
) : (
  <Link
    to="/login"
    className="text-sm bg-[#FBBF24] text-black px-4 py-2 rounded hover:bg-[#F59E0B] transition"
  >
    Iniciar Sesión
  </Link>
)}
</div>
      </header>

      {/* NAV */}
      <nav className="flex justify-center gap-10 py-3 bg-[#1E3A8A]/90 backdrop-blur-md w-full">
        <button className="hover:text-[#FBBF24] transition">Instrumentos</button>
        <button className="hover:text-[#FBBF24] transition">Accesorios</button>
        <button className="hover:text-[#FBBF24] transition">Ofertas</button>

        <Link
          to="/comunidad"
          className="hover:text-[#FBBF24] transition font-semibold"
        >
          Comunidad
        </Link>
        <Link
          to="/marketplace"
          className="hover:text-[#FBBF24] transition font-semibold"
        >
          Marketplace
        </Link>
        <button className="hover:text-[#FBBF24] transition">Marketplace</button>
      </nav>

      {/* SECCIÓN PRINCIPAL */}
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-[#FBBF24] text-center">
          🎶 Productos disponibles
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

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
                    src={p.imagen_url || `https://placehold.co/200x150?text=${encodeURIComponent(p.nombre)}`} 
                    alt={p.nombre}
/>

                    <h3 className="text-xl font-semibold mt-2">{p.nombre}</h3>

                    {/* Mostrar el precio del producto */}
                    {p.ofertas && p.ofertas.length > 0 ? (
                      <p className="text-gray-300 font-bold text-lg">
                        ${p.ofertas[0].precio_centavos.toLocaleString("es-CL")}
                      </p>
                    ) : (
                      <p className="text-gray-300">$ —</p>
                    )}

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

