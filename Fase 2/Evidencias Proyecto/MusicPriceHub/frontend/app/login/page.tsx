"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, User } from "lucide-react";

import { guardarSesion } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "https://musicpricehub.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contraseña: contrasena }),
        }
      );

      if (!response.ok) {
        throw new Error("Login incorrecto");
      }

      const data = await response.json();

localStorage.setItem("access_token", data.access_token);

localStorage.setItem(
  "usuario",
  JSON.stringify({
    id: data.usuario.id,
    nombre: data.usuario.nombre_publico,
    correo: data.usuario.correo,
    avatar_url: data.usuario.perfil?.avatar_url ?? ""
  })
);

localStorage.setItem("access_token", data.access_token);

      window.location.href = "/";
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
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
          <User size={48} className="text-brand-accent" />
          <h2 className="text-2xl font-bold mt-2">Iniciar Sesión</h2>
          <p className="text-page-soft text-sm mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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

          {/* Botón */}
          <button
            type="submit"
            className="w-full mt-3 bg-brand-accent text-black font-semibold py-2 rounded hover:bg-brand-accent-soft transition"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-sm text-page-soft mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-brand-accent hover:underline">
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
