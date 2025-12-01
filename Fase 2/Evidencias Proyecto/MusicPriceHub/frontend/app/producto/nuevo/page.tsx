"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CrearProductoPage() {
  const router = useRouter();

  // Primero TODOS los hooks, arriba del todo
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [imagen, setImagen] = useState<File | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    descripcion: "",
    imagen_url: "",
    url_fuente: "",
    especificaciones: "",
    precio_base_centavos: "",
    categoria_id: "",
  });

  const [mensaje, setMensaje] = useState("");

  // 🔐 Proteccion de ruta
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (!u) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(u);
    if (!user.es_admin) {
      router.push("/");
      return;
    }

    setIsAdmin(true);
  }, []);

  // Render temporal mientras carga admin
  if (isAdmin === null) {
    return <p className="p-6 text-center">Cargando...</p>;
  }

  // Form functions
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
  e.preventDefault();

  let especObj = null;
  if (form.especificaciones.trim() !== "") {
    try {
      especObj = JSON.parse(form.especificaciones);
    } catch (e) {
      return setMensaje("⚠️ El campo especificaciones debe ser JSON válido.");
    }
  }

  // =============================================
  // 1. SUBIR IMAGEN A CLOUDINARY
  // =============================================
let imagen_url = null;

if (imagen) {
  const formData = new FormData();
  formData.append("file", imagen);
  formData.append("upload_preset", "musicpricehub_unsigned");

  const resImg = await fetch(
    "https://api.cloudinary.com/v1_1/dpposzqtv/image/upload",
    { method: "POST", body: formData }
  );

  const dataImg = await resImg.json();
  imagen_url = dataImg.secure_url;
}

// AHORA ARMAMOS EL PAYLOAD
const payload = {
  nombre: form.nombre,
  marca: form.marca,
  modelo: form.modelo,
  descripcion: form.descripcion,
  imagen_url: imagen_url,  // YA ESTÁ DEFINIDA
  url_fuente: form.url_fuente,
  especificaciones: especObj,
  precio_base_centavos: form.precio_base_centavos
    ? parseInt(form.precio_base_centavos)
    : null,
  categoria_id: form.categoria_id || null,
};
  // =============================================
  // 3. ENVIAR PRODUCTO A TU BACKEND
  // =============================================
  const res = await fetch("https://musicpricehub.onrender.com/api/productos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    setMensaje("❌ Error al crear producto");
    return;
  }

  setMensaje("✅ Producto creado correctamente");

  setForm({
    nombre: "",
    marca: "",
    modelo: "",
    descripcion: "",
    imagen_url: "",
    url_fuente: "",
    especificaciones: "",
    precio_base_centavos: "",
    categoria_id: "",
  });
};


  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-brand-accent">
        Agregar nuevo producto 🎸
      </h1>

      {mensaje && <p className="mb-4 text-center">{mensaje}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full p-2 rounded bg-brand-card"
          placeholder="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <input
          className="w-full p-2 rounded bg-brand-card"
          placeholder="Marca"
          name="marca"
          value={form.marca}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 rounded bg-brand-card"
          placeholder="Modelo"
          name="modelo"
          value={form.modelo}
          onChange={handleChange}
        />

        <textarea
          className="w-full p-2 rounded bg-brand-card"
          placeholder="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files?.[0] || null)}
          className="mt-2 border border-gray-700 p-2 rounded bg-[#0b1120]"
        />

        <input
          className="w-full p-2 rounded bg-brand-card"
          placeholder="URL fuente"
          name="url_fuente"
          value={form.url_fuente}
          onChange={handleChange}
        />

        <textarea
          className="w-full p-2 rounded bg-brand-card"
          placeholder='Especificaciones (JSON)  Ej: { "cuerpo": "Caoba" }'
          name="especificaciones"
          value={form.especificaciones}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 rounded bg-brand-card"
          placeholder="Precio base en centavos (ej: 1299990)"
          name="precio_base_centavos"
          value={form.precio_base_centavos}
          onChange={handleChange}
          type="number"
        />

        <button
          type="submit"
          className="bg-brand-accent text-black p-3 rounded w-full font-bold"
        >
          Crear producto
        </button>
      </form>
    </main>
  );
}
