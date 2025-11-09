import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Datos del registro:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
      <div className="w-[420px] bg-[#1E293B] rounded-2xl shadow-2xl border border-[#FBBF24]/40 p-8 text-white flex flex-col items-center">
        {/* 🔙 Volver al inicio */}
        <div className="w-full mb-4">
          <Link
            to="/"
            className="flex items-center text-[#FBBF24] hover:text-[#F59E0B] transition text-sm"
          >
            <ArrowLeft size={18} className="mr-2" />
            Volver al inicio
          </Link>
        </div>

        {/* Encabezado */}
        <UserPlus size={50} color="#FBBF24" />
        <h2 className="text-2xl font-bold mt-2 text-white">Crear Cuenta</h2>
        <p className="text-gray-400 text-sm mt-1 text-center">
          Completa los siguientes campos para registrarte
        </p>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center mt-6 space-y-5"
        >
          {/* Nombre */}
          <div className="w-4/5 text-center">
            <label className="block text-sm text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-[#0f172a] text-white 
              border border-transparent focus:border-[#FBBF24] focus:ring-1 
              focus:ring-[#FBBF24] outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="w-4/5 text-center">
            <label className="block text-sm text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md bg-[#0f172a] text-white 
              border border-transparent focus:border-[#FBBF24] focus:ring-1 
              focus:ring-[#FBBF24] outline-none transition"
            />
          </div>

          {/* Contraseña */}
          <div className="w-4/5 text-center">
            <label className="block text-sm text-gray-300 mb-1">
              Contraseña
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 rounded-md bg-[#0f172a] text-white 
                border border-transparent focus:border-[#FBBF24] focus:ring-1 
                focus:ring-[#FBBF24] outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#FBBF24] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="w-4/5 text-center">
            <label className="block text-sm text-gray-300 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 rounded-md bg-[#0f172a] text-white 
                border border-transparent focus:border-[#FBBF24] focus:ring-1 
                focus:ring-[#FBBF24] outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#FBBF24] transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-4/5 py-2 bg-[#FBBF24] text-black font-semibold rounded-md 
            hover:bg-[#F59E0B] shadow-md hover:shadow-lg transition"
          >
            Crear Cuenta
          </button>
        </form>

        {/* Enlace de regreso */}
        <p className="text-center text-sm text-gray-400 mt-5">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-[#FBBF24] hover:underline font-semibold"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
