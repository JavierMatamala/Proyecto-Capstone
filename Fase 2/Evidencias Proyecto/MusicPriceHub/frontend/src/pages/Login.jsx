import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, User } from "lucide-react";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://musicpricehub-api.onrender.com/auth/login"
, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }

      const data = await response.json();

      // ✅ Guardamos el token y los datos del usuario en localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "usuario",
        JSON.stringify({
        nombre: data.usuario.nombre,
        correo: data.usuario.correo,})
);

      // Redirigir al Home
      navigate("/");
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
      <div className="w-[420px] bg-[#1E293B] rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-[#FBBF24] hover:underline flex items-center">
            <ArrowLeft size={18} className="mr-1" /> Volver al inicio
          </Link>
        </div>

        <div className="flex flex-col items-center mb-6">
          <User size={48} color="#FBBF24" />
          <h2 className="text-2xl font-bold mt-2">Iniciar Sesión</h2>
          <p className="text-gray-400 text-sm text-center mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-300">Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-[#0f172a] border border-gray-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Contraseña</label>
            <div className="flex items-center bg-[#0f172a] border border-gray-600 rounded mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="w-full p-2 bg-transparent focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-3 bg-[#FBBF24] text-black font-semibold py-2 rounded hover:bg-[#F59E0B] transition"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-[#FBBF24] hover:underline">
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
