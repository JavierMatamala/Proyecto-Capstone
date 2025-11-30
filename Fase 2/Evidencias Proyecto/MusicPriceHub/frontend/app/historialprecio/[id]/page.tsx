"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HistorialPrecios from "../../../components/HistorialPrecios";

export default function ProductoPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id;

  const [producto, setProducto] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    // 👉 Si todavía no tenemos id, no hacemos fetch
    if (!id) return;

    const cargarDatos = async () => {
      try {
        console.log("ID del producto desde useParams:", id);

        // 🔹 Obtener producto
        const resProd = await fetch(`${API_URL}/api/productos/${id}`);
        const dataProd = await resProd.json();
        setProducto(dataProd);

        // 🔹 Obtener historial
        const resHist = await fetch(`${API_URL}/api/precios/historial/${id}`);
        const dataHist = await resHist.json();
        setHistorial(dataHist);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  if (!id) {
    return <p className="p-10 text-white">Esperando ID del producto...</p>;
  }

  if (loading) return <p className="p-10 text-white">Cargando...</p>;
  if (!producto) return <p className="p-10 text-red-400">Producto no encontrado</p>;

  return (
    <div className="p-10 text-white space-y-8">
      <h1 className="text-3xl font-bold">{producto.nombre}</h1>

      {producto.imagen_url && (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-80 rounded-xl shadow-lg"
        />
      )}

      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-[#FBBF24] mb-4">
          Historial de Precios
        </h2>

        {historial.length === 0 ? (
          <p className="text-gray-400">No hay historial disponible.</p>
        ) : (
          <HistorialPrecios data={historial} />
        )}
      </div>
    </div>
  );
}
