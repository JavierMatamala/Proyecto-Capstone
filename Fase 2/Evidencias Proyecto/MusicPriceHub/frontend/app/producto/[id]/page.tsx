"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HistorialPrecios from "../../../components/HistorialPrecios";

const API_URL = "https://musicpricehub.onrender.com";

export default function ProductoDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  // ---------------- ALERTAS ----------------
  const [alertaOpen, setAlertaOpen] = useState(false);
  const [precioObjetivo, setPrecioObjetivo] = useState("");
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  // Nueva alerta tipo toast
  const [alertaExitosa, setAlertaExitosa] = useState("");
  // ----------------------------------------

  // Cargar usuario/token después de render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("access_token");
      const raw = localStorage.getItem("usuario");

      let u = null;
      try {
        u = raw ? JSON.parse(raw) : null;
      } catch {
        u = null;
      }

      setToken(t);
      setUsuario(u);
    }
    const cargarHistorial = async () => {
      try {
        console.log("ID del producto desde useParams:", id);
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
    cargarHistorial();
  }, []);

  const cargarDetalle = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}/detalle-frontend`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  // ---------------- CREAR ALERTA ----------------
  const crearAlerta = async () => {
    setMensajeAlerta("");

    // Validación final
    if (!token || !usuario || !usuario.id) {
      setMensajeAlerta("Debes iniciar sesión para crear alertas.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/productos/${id}/alertas/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          precio_objetivo: Number(precioObjetivo),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMensajeAlerta(json.detail || "Error desconocido.");
        return;
      }

      // ÉXITO
      setAlertaOpen(false);
      setPrecioObjetivo("");

      // 🔥 Mostrar toast de éxito
      setAlertaExitosa("Alerta creada exitosamente ✔️");

      setTimeout(() => setAlertaExitosa(""), 3000);

    } catch (err) {
      setMensajeAlerta("Error al conectar con el servidor.");
    }
  };
  // ------------------------------------------------

  if (loading || !data) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <p className="text-center text-gray-400">Cargando producto...</p>
      </main>
    );
  }

  const p = data.producto;
  const precios = data.precios ?? [];

  const preciosOrdenados = [...precios].sort((a, b) => a.precio - b.precio);

  return (
    <main className="max-w-7xl mx-auto p-6 flex flex-col gap-10">

      {/* ========================================================== */}
      <div className="grid grid-cols-[1fr_1.3fr_0.8fr] gap-10 items-start">

        {/* IMAGEN */}
        <div className="flex justify-center">
          <img
            src={p.imagen_url}
            alt={p.nombre}
            className="w-[420px] h-[420px] object-cover rounded-xl shadow"
          />
        </div>

        {/* TÍTULO */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-between">
            {p.nombre}

            {/* BOTÓN DE ALERTA */}
            <button
              onClick={() => setAlertaOpen(true)}
              className="ml-4 px-4 py-2 bg-brand-accent text-black text-sm font-semibold rounded hover:bg-brand-accent-soft"
            >
              Crear alerta
            </button>
          </h1>

          <p className="text-gray-400 mb-4">
            {p.marca} {p.modelo}
          </p>

          <p className="whitespace-pre-line leading-relaxed text-gray-300">
            {p.descripcion}
          </p>
        </div>

        {/* PRECIOS POR TIENDA */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Precios por tienda</h2>

          {preciosOrdenados.length === 0 && (
            <p className="text-gray-500 mb-4">
              Este producto no tiene ofertas aún.
            </p>
          )}

          <div className="space-y-3">
            {preciosOrdenados.map((x: any, i: number) => (
              <a
                key={i}
                href={x.url_producto}
                className="block p-4 rounded-lg bg-[#111827] hover:bg-[#1f2937]"
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex justify-between items-center">
                  <strong>{x.tienda}</strong>
                  <span className="text-brand-accent font-bold text-lg">
                    ${x.precio.toLocaleString("es-CL")}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{x.disponibilidad}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* HISTORIAL */}
      <HistorialPrecios data={historial} />

      {/* ================== MODAL ALERTA ================== */}
      {alertaOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] p-6 rounded-xl shadow-xl w-[360px] border border-gray-700">

            <h3 className="text-lg font-semibold text-brand-accent mb-3">
              Crear alerta de precio
            </h3>

            <p className="text-gray-400 mb-3">
              Recibirás una notificación cuando este producto baje al precio que indiques.
            </p>

            <input
              type="number"
              placeholder="Ej: 1000000"
              value={precioObjetivo}
              onChange={(e) => setPrecioObjetivo(e.target.value)}
              className="w-full p-2 rounded bg-[#1e293b] text-white border border-gray-600 focus:ring-2 focus:ring-brand-accent mb-4"
            />

            {mensajeAlerta && (
              <p className="text-red-400 text-sm mb-3">{mensajeAlerta}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAlertaOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>

              <button
                onClick={crearAlerta}
                className="px-4 py-2 bg-brand-accent text-black font-semibold rounded hover:bg-brand-accent-soft"
              >
                Crear alerta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== TOAST EXITOSO ================== */}
      {alertaExitosa && (
        <div className="fixed bottom-6 right-6 bg-brand-accent text-black px-5 py-3 rounded-lg shadow-xl text-sm font-semibold animate-fadeIn z-[9999]">
          {alertaExitosa}
        </div>
      )}

    </main>
  );
}
