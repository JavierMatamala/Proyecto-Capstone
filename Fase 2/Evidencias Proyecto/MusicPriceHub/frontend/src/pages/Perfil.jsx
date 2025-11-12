import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Perfil() {
  const [perfil, setPerfil] = useState({
    correo: "",
    nombre_publico: "",
    pais: "",
    ciudad: "",
  });
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  // ✅ Cargar datos del perfil
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://musicpricehub-api.onrender.com/perfil/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPerfil(data))
      .catch(() => setMensaje("Error al cargar el perfil"));
  }, []);

  // ✅ Guardar cambios
  const handleGuardar = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch("https://musicpricehub.onrender.com/perfil/actualizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(perfil),
    });

    if (response.ok) {
      setMensaje("✅ Perfil actualizado correctamente");
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          nombre: perfil.nombre_publico,
          correo: perfil.correo,
        })
      );
      setTimeout(() => {
        navigate("/perfil");
      }, 1200);
    } else {
      setMensaje("❌ Error al actualizar el perfil");
    }
  };

  // ✅ Cambiar contraseña
  const handleCambiarContrasena = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch("https://musicpricehub.onrender.com/perfil/cambiar_contrasena", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contrasena_actual: contrasenaActual,
        contrasena_nueva: nuevaContrasena,
      }),
    });

    if (response.ok) {
      setMensaje("🔒 Contraseña actualizada correctamente");
      setContrasenaActual("");
      setNuevaContrasena("");
    } else {
      setMensaje("❌ Error al cambiar la contraseña");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-white p-6">
      <div className="bg-[#1F2937] w-full max-w-lg p-8 rounded-2xl shadow-2xl border border-[#FBBF24]/20">
        <h1 className="text-3xl font-bold text-[#FBBF24] mb-6 text-center">
          ✏️ Editar Perfil
        </h1>

        {mensaje && (
          <p className="text-center text-[#FBBF24] mb-4 font-semibold">
            {mensaje}
          </p>
        )}

        {/* ---- Datos del perfil ---- */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Correo electrónico</label>
            <input
              type="text"
              value={perfil.correo}
              disabled
              className="w-full bg-gray-800 text-gray-400 px-4 py-2 rounded-md outline-none border border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nombre público</label>
            <input
              type="text"
              value={perfil.nombre_publico || ""}
              onChange={(e) =>
                setPerfil({ ...perfil, nombre_publico: e.target.value })
              }
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none border border-gray-700 focus:border-[#FBBF24]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">País</label>
            <input
              type="text"
              value={perfil.pais || ""}
              onChange={(e) => setPerfil({ ...perfil, pais: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none border border-gray-700 focus:border-[#FBBF24]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Ciudad</label>
            <input
              type="text"
              value={perfil.ciudad || ""}
              onChange={(e) => setPerfil({ ...perfil, ciudad: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none border border-gray-700 focus:border-[#FBBF24]"
            />
          </div>

          <button
            onClick={handleGuardar}
            className="w-full mt-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-black py-2 rounded-md font-semibold transition"
          >
            Guardar Cambios
          </button>
        </div>

        {/* ---- Línea divisoria ---- */}
        <hr className="my-6 border-gray-600" />

        {/* ---- Cambiar contraseña ---- */}
        <h2 className="text-xl font-bold text-[#FBBF24] mb-4 text-center">
          🔒 Cambiar Contraseña
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none border border-gray-700 focus:border-[#FBBF24]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none border border-gray-700 focus:border-[#FBBF24]"
            />
          </div>

          <button
            onClick={handleCambiarContrasena}
            className="w-full mt-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-2 rounded-md font-semibold transition"
          >
            Actualizar Contraseña
          </button>
        </div>

        {/* ---- Volver ---- */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/perfil")}
            className="text-sm text-[#FBBF24] hover:text-[#F59E0B] transition"
          >
            ← Volver al perfil
          </button>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
