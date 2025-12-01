"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo, contraseña: contrasena }),
        }
      );

      if (!response.ok) {
        throw new Error("Login incorrecto");
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      if (data.usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            id: data.usuario.id,
            correo: data.usuario.correo,
            nombre: data.usuario.nombre,
            avatar_url: data.usuario.avatar_url ?? "",
            es_admin: data.usuario.es_admin,
          })
        );
      }
      router.push("/");
      window.location.href = "/";
    } catch (_) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-500 mb-4 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </button>

        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <User className="w-6 h-6" />
          Iniciar sesión
        </h1>
        <p className="text-gray-600 mb-4">
          Ingresa tus credenciales para continuar
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-500">
            {error}
          </p>
        )}

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
    </main>
  );
}

        
