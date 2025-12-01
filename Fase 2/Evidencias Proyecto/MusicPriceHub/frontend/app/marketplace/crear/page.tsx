"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, PlusCircle } from "lucide-react";
import {ChatWidget} from "../../chat/chat";
export default function CrearPublicacion() {
  
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<string>("");
  const [ciudad, setCiudad] = useState("");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagenes([...imagenes, ...Array.from(e.target.files)]);
    }
  };

  // ==== MÁSCARA CLP ====

  const formatearCLP = (valor: string) => {
    const soloDigitos = valor.replace(/\D/g, "");
    if (!soloDigitos) return "";
    return Number(soloDigitos).toLocaleString("es-CL");
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const entrada = e.target.value;
    const formateado = formatearCLP(entrada);
    setPrecio(formateado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo || !precio) {
      setError("El título y el precio son obligatorios.");
      return;
    }

    setCargando(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Debes iniciar sesión para publicar.");
        setCargando(false);
        return;
      }

      // convertir "250.000" -> 250000
      const precioNumerico = Number(precio.replace(/\./g, ""));

      // 1) Crear la publicación sin imágenes
      const resp = await fetch("https://musicpricehub.onrender.com/mercado/publicaciones", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          precio_centavos: precioNumerico,
          ciudad,
        }),
      });

      if (!resp.ok) throw new Error("No se pudo crear la publicación");

      const nueva = await resp.json();

      // 2) Subir las imágenes (si hay)
      for (const img of imagenes) {
        const formData = new FormData();
        formData.append("file", img);

        // 2.1 Subir a Cloudinary a través de tu backend
        const resUpload = await fetch("https://musicpricehub.onrender.com/upload/imagen", {
          method: "POST",
          body: formData,
        });

        if (!resUpload.ok) {
          throw new Error("No se pudo subir una imagen a Cloudinary");
        }

        const dataUpload = await resUpload.json(); // { url, public_id }

        // 2.2 Registrar la URL en la publicación
        await fetch(
          `https://musicpricehub.onrender.com/mercado/publicaciones/${nueva.id}/imagenes-cloud`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url_imagen: dataUpload.url,
            }),
          }
        );
      }

      router.push(`/marketplace/${nueva.id}`);
    } catch (_) {
      setError("Error al crear la publicación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center text-brand-accent mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver
      </button>

      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <PlusCircle className="w-6 h-6" />
        Crear publicación
      </h1>

      {error && (
        <p className="mb-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
            placeholder="Ej: Guitarra Fender Stratocaster"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none min-h-[90px]"
            placeholder="Detalles del instrumento, estado, etc."
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium mb-1">Precio (CLP)</label>
          <input
            value={precio}
            onChange={handlePrecioChange}
            inputMode="numeric"
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
            placeholder="$ 250.000"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
            placeholder="Santiago, Viña del Mar…"
          />
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium mb-1">Imágenes</label>
          <label className="inline-flex items-center px-3 py-2 bg-brand-accent text-black rounded cursor-pointer gap-2">
            <Upload className="w-4 h-4" />
            Subir imágenes
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImages}
            />
          </label>

          {imagenes.length > 0 && (
            <ul className="mt-2 text-sm text-gray-300 space-y-1">
              {imagenes.map((img, idx) => (
                <li key={idx}>{img.name.substring(0, 12)}…</li>
              ))}
            </ul>
          )}
        </div>

        {/* Botón publicar */}
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 rounded bg-brand-accent text-black font-semibold disabled:opacity-60"
        >
          {cargando ? "Creando..." : "Publicar"}
        </button>
      </form>
      <ChatWidget />
    </main>
  );
}
