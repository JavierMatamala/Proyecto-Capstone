import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function PerfilInfo() {
  const [perfil, setPerfil] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  // ✅ Cargar los datos del perfil desde la API
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://musicpricehub.onrender.com/perfil/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          setMensaje("⚠️ Sesión expirada, inicia sesión nuevamente.");
          localStorage.removeItem("access_token");
          localStorage.removeItem("usuario");
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPerfil(data);
      })
      .catch(() => setMensaje("Error al cargar el perfil ❌"));
  }, []);

  if (!perfil) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white p-10">
      <h1 className="text-3xl font-bold text-[#FBBF24] mb-6 text-center">
        Perfil de Usuario
      </h1>

      {mensaje && <p className="text-center text-yellow-400 mb-4">{mensaje}</p>}

      <div className="max-w-md mx-auto bg-[#1F2937] p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl font-semibold text-[#FBBF24] mb-4">
          👋 Hola, {perfil.nombre_publico || "Usuario"}
        </p>

        <div className="space-y-2 text-gray-300">
          <p>
            <strong>Correo:</strong> {perfil.correo}
          </p>
          <p>
            <strong>País:</strong> {perfil.pais || "No especificado"}
          </p>
          <p>
            <strong>Ciudad:</strong> {perfil.ciudad || "No especificada"}
          </p>
        </div>

        <button
          onClick={() => navigate("/perfil/editar")}
          className="mt-6 bg-[#FBBF24] text-black px-4 py-2 rounded font-semibold hover:bg-[#F59E0B] transition"
        >
          ✏️ Editar Perfil
        </button>

        <div className="mt-4">
          <Link
            to="/"
            className="text-sm text-[#FBBF24] hover:text-[#F59E0B] transition"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PerfilInfo;
