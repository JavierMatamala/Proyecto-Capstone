"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";

export default function MisAlertasPage() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const cargarAlertas = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/productos/alertas/mis-alertas-detalladas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const json = await res.json();
      setAlertas(json.alertas ?? []);
    } catch (err) {
      console.error("Error cargando alertas:", err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarAlerta = async (id: string) => {
    if (!token) return;

    await fetch(`${API_URL}/api/productos/alertas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // recargar
    cargarAlertas();
  };

  useEffect(() => {
    if (token) cargarAlertas();
  }, [token]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Cargando alertas...</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-brand-accent">
        Mis alertas de precio
      </h1>

      {alertas.length === 0 && (
        <p className="text-gray-400">No tienes alertas creadas.</p>
      )}

      <div className="space-y-4">
        {alertas.map((a) => (
          <div
            key={a.id}
            className="bg-[#111827] p-4 rounded-lg border border-gray-700 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">
                {a.producto_nombre}
              </h3>

              <p className="text-gray-400">
                Precio objetivo:{" "}
                <strong>${a.precio_objetivo.toLocaleString("es-CL")}</strong>
              </p>

              <p className="text-gray-500 text-sm">
                Creada: {new Date(a.creada_en).toLocaleString("es-CL")}
              </p>

              <p className={`text-sm mt-1 ${a.cumplida ? "text-green-400" : "text-yellow-400"}`}>
                {a.cumplida ? "🔔 Alerta cumplida" : "⏳ Aún no se cumple"}
              </p>
            </div>

            <button
              onClick={() => eliminarAlerta(a.id)}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
