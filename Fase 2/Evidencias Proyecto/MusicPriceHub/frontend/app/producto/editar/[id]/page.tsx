"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Producto = {
  id: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  descripcion?: string | null;
  especificaciones?: any;
  precio_base_centavos?: number | null;
  imagen_url?: string | null;
  url_fuente?: string | null; // 🔥 AGREGADO
};

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    descripcion: "",
    especificaciones: "",
    precio_base_centavos: "",
    url_fuente: "", // 🔥 AGREGADO
  });

  const [imagenUrlActual, setImagenUrlActual] = useState<string | null>(null);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  // Cargar datos del producto
  useEffect(() => {
    if (!id) return;

    const cargarProducto = async () => {
      try {
        const res = await fetch(`https://musicpricehub.onrender.com/api/productos/${id}`);
        if (!res.ok) {
          throw new Error("Error al obtener producto");
        }

        const data: Producto = await res.json();

        setForm({
          nombre: data.nombre ?? "",
          marca: data.marca ?? "",
          modelo: data.modelo ?? "",
          descripcion: data.descripcion ?? "",
          especificaciones: data.especificaciones
            ? JSON.stringify(data.especificaciones, null, 2)
            : "",
          precio_base_centavos:
            data.precio_base_centavos != null
              ? String(data.precio_base_centavos)
              : "",
          url_fuente: data.url_fuente ?? "", // 🔥 AGREGADO
        });

        setImagenUrlActual(data.imagen_url ?? null);
      } catch (err) {
        console.error(err);
        setMensaje("❌ Error al cargar el producto");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!id) return;

    let especObj: any = null;
    if (form.especificaciones.trim() !== "") {
      try {
        especObj = JSON.parse(form.especificaciones);
      } catch {
        setMensaje("⚠️ El campo especificaciones debe ser JSON válido.");
        return;
      }
    }

    let nuevaImagenUrl: string | null = null;

    if (nuevaImagen) {
      const formData = new FormData();
      formData.append("file", nuevaImagen);
      formData.append("upload_preset", "musicpricehub_unsigned");

      const resImg = await fetch(
        "https://api.cloudinary.com/v1_1/dpposzqtv/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const dataImg = await resImg.json();
      nuevaImagenUrl = dataImg.secure_url;
    }

    // ============================================================
    //  🔥 PAYLOAD con URL fuente incluida
    // ============================================================
    const payload = {
      nombre: form.nombre,
      marca: form.marca || null,
      modelo: form.modelo || null,
      descripcion: form.descripcion || null,
      especificaciones: especObj,
      precio_base_centavos:
        form.precio_base_centavos !== ""
          ? parseInt(form.precio_base_centavos, 10)
          : null,
      imagen_url: nuevaImagenUrl ?? imagenUrlActual,
      url_fuente: form.url_fuente || null, // 🔥 AGREGADO
    };

    try {
      const res = await fetch(`https://musicpricehub.onrender.com/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar producto");

      setMensaje("✅ Producto actualizado correctamente");

      // 🔥 REDIRECCIÓN A LA PRINCIPAL (Ajusta si tu ruta es distinta)
      router.push("/");

    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al actualizar el producto");
    }
  };

  if (cargando) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <p className="text-center">Cargando producto...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-brand-accent">
        Editar producto
      </h1>

      {mensaje && <p className="mb-4 text-center">{mensaje}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* Nombre */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">Nombre</label>
          <input
            className="w-full p-2 rounded bg-brand-card"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Marca */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">Marca</label>
          <input
            className="w-full p-2 rounded bg-brand-card"
            name="marca"
            value={form.marca}
            onChange={handleChange}
          />
        </div>

        {/* Modelo */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">Modelo</label>
          <input
            className="w-full p-2 rounded bg-brand-card"
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
          />
        </div>

        {/* 🔥 URL Fuente */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">
            URL fuente
          </label>
          <input
            className="w-full p-2 rounded bg-brand-card"
            name="url_fuente"
            placeholder="URL Del Producto"
            value={form.url_fuente}
            onChange={handleChange}
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">Imagen</label>

          {imagenUrlActual && (
            <img
              src={imagenUrlActual}
              alt="Imagen actual"
              className="w-40 h-40 object-cover rounded mb-2"
            />
          )}

          <input
            type="file"
            accept="image/*"
            className="w-full p-2 rounded bg-brand-card"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setNuevaImagen(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">
            Descripción
          </label>
          <textarea
            className="w-full p-2 rounded bg-brand-card"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        {/* Especificaciones */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">
            Especificaciones (JSON)
          </label>
          <textarea
            className="w-full p-2 rounded bg-brand-card"
            name="especificaciones"
            value={form.especificaciones}
            onChange={handleChange}
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block mb-1 text-sm text-page-soft">
            Precio base en centavos
          </label>
          <input
            className="w-full p-2 rounded bg-brand-card"
            name="precio_base_centavos"
            type="number"
            value={form.precio_base_centavos}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="bg-brand-accent text-black p-3 rounded w-full font-bold"
        >
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
