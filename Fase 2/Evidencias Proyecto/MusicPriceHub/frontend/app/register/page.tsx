"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
  e.preventDefault();
  setError("");

  if (contrasena !== confirmarContrasena) {
    setError("Las contraseñas no coinciden.");
    return;
  }

  try {
    const response = await fetch(
      "https://musicpricehub.onrender.com/auth/registro",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          contraseña: contrasena,
        }),
      }
    );

    // Si la API devuelve 201 o 200 = éxito
    if (response.status === 201 || response.status === 200) {
      // Intentar leer JSON si existe
      let data = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      // Guardar token si viene
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // Guardar usuario si viene
      if (data?.usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            id: data.usuario.id,
            nombre: data.usuario.nombre_publico,
            correo: data.usuario.correo,
            avatar_url: data.usuario.perfil?.avatar_url ?? "",
          })
        );
      }

      // Redirigir siempre al login
      router.push("/login");
      return;
    }

    // Si NO es éxito, intentar obtener error del backend
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (_) {}

    setError(errorData?.detail || "No se pudo crear la cuenta.");
  } catch (_) {
    setError("No se pudo crear la cuenta. Intenta nuevamente.");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-page">
      <div className="w-[420px] bg-brand-card rounded-2xl shadow-lg p-8">

        {/* Volver */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="text-brand-accent hover:underline flex items-center"
          >
            <ArrowLeft size={18} className="mr-1" /> Volver al inicio
          </Link>
        </div>

        {/* Ícono */}
        <div className="flex flex-col items-center mb-6">
          <UserPlus size={48} className="text-brand-accent" />
          <h2 className="text-2xl font-bold mt-2">Crear Cuenta</h2>
          <p className="text-page-soft text-sm mt-1 text-center">
            Completa tus datos para unirte a MusicPriceHub
          </p>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Nombre */}
          <div>
            <label className="text-sm text-page-soft">Nombre público</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label className="text-sm text-page-soft">Correo electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm text-page-soft">Contraseña</label>
            <div className="flex items-center bg-page border border-brand-accent-soft/40 rounded mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="********"
                className="w-full p-2 bg-transparent outline-none"
                required
              />

              <button
                type="button"
                className="px-2 text-page-soft"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="text-sm text-page-soft">Confirmar contraseña</label>
            <div className="flex items-center bg-page border border-brand-accent-soft/40 rounded mt-1">
              <input
                type={showPassword2 ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="********"
                className="w-full p-2 bg-transparent outline-none"
                required
              />

              <button
                type="button"
                className="px-2 text-page-soft"
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full mt-3 bg-brand-accent text-black font-semibold py-2 rounded hover:bg-brand-accent-soft transition"
          >
            Crear Cuenta
          </button>
        </form>

        <p className="text-center text-sm text-page-soft mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-brand-accent hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
