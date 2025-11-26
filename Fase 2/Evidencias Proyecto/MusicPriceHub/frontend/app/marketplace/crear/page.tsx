"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, PlusCircle } from "lucide-react";

export default function CrearPublicacion() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagenes([...imagenes, ...Array.from(e.target.files)]);
    }
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

      // 1) Crear la publicación sin imágenes
      const resp = await fetch("https://musicpricehub.onrender.com/mercado/publicaciones", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          precio_centavos: Number(precio),
          ciudad,
        })
      });

      if (!resp.ok) throw new Error("No se pudo crear la publicación");

      const nueva = await resp.json();

      // 2) Subir las imágenes (si hay)
      for (const img of imagenes) {
        const formData = new FormData();
        formData.append("archivo", img);

        await fetch(
          `https://musicpricehub.onrender.com/mercado/publicaciones/${nueva.id}/imagenes`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          }
        );
      }

      router.push(`/marketplace/${nueva.id}`);
    } catch (err) {
      setError("Error al crear la publicación.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-brand-card rounded-2xl shadow-lg border border-brand-accent/20">
      <button
        onClick={() => router.back()}
        className="flex items-center text-brand-accent mb-4 hover:underline"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver
      </button>

      <h1 className="text-2xl font-bold text-brand-accent mb-6">
        Crear publicación
      </h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Título */}
        <div>
          <label className="text-sm text-page-soft">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
            placeholder="Ej: Guitarra Fender Stratocaster"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="text-sm text-page-soft">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none min-h-[90px]"
            placeholder="Detalles del instrumento, estado, etc."
          />
        </div>

        {/* Precio */}
        <div>
          <label className="text-sm text-page-soft">Precio (CLP)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
            placeholder="250000"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="text-sm text-page-soft">Ciudad</label>
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-page border border-brand-accent-soft/40 outline-none"
            placeholder="Santiago, Viña del Mar…"
          />
        </div>

        {/* Imágenes */}
        <div>
          <label className="text-sm text-page-soft">Imágenes</label>

          <div className="mt-2 p-4 border border-dashed border-brand-accent-soft/50 rounded-xl bg-page cursor-pointer">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="h-7 w-7 text-brand-accent mb-2" />
              <span className="text-brand-accent-soft">Subir imágenes</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleImages}
              />
            </label>
          </div>

          {imagenes.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagenes.map((img, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 bg-brand-header rounded-md flex items-center justify-center text-xs text-page-soft border border-brand-accent-soft/20"
                >
                  {img.name.substring(0, 12)}…
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón publicar */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-brand-accent text-black font-semibold py-2 rounded-md hover:bg-brand-accent-soft shadow"
        >
          {cargando ? "Creando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
