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

  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/registro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            correo,
            contraseña: contrasena,
          }),
        }
      );

      if (response.status === 201 || response.status === 200) {
        let data: any = null;
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }

        if (data?.usuario) {
          localStorage.setItem(
            "usuario",
            JSON.stringify({
              id: data.usuario.id,
              correo: data.usuario.correo,
              nombre: data.usuario.nombre,
              avatar_url: data.usuario.avatar_url ?? "",
              es_admin: data.usuario.es_admin === true,
            })
          );
        }

        router.push("/login");
        return;
      }

      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch (_) {}

      if (errorData && Array.isArray(errorData.detail)) {
      // típico formato de Pydantic: detail = [{msg, loc, ...}, ...]
      setError(errorData.detail[0]?.msg ?? "No se pudo crear la cuenta.");
      } else if (typeof errorData?.detail === "string") {
        setError(errorData.detail);
      } else {
        setError("No se pudo crear la cuenta.");
      }
    } catch (_) {
      setError("Error de conexión al crear la cuenta.");
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
          <UserPlus className="w-6 h-6" />
          Crear cuenta
        </h1>
        <p className="text-gray-600 mb-4">
          Completa tus datos para unirte a MusicPriceHub
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-500">
            {error}
          </p>
        )}

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
    </main>
  );
}


