"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReportesPage() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargarReportes() {
    const token = localStorage.getItem("access_token");

    const res = await fetch("http://localhost:8000/comunidad/reportes/mensajes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setReportes(data);
    setCargando(false);
  }

  async function resolverReporte(id: string) {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `http://localhost:8000/comunidad/reportes/mensajes/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: "resuelto",
        }),
      }
    );

    if (!res.ok) {
      alert("Error al resolver reporte.");
      return;
    }

    cargarReportes();
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0b0d11] text-white flex items-center justify-center">
        Cargando reportes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d11] pt-24 px-6 text-white">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-brand-accent mb-8">
          Panel de Reportes
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full bg-[#111318] border border-[#1f242d] rounded-xl">
            <thead className="bg-[#1a1d24]">
              <tr>
                <th className="p-3 text-left">Mensaje</th>
                <th className="p-3 text-left">Motivo</th>
                <th className="p-3 text-left">Reportó</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reportes.map((r) => (
                <tr key={r.id} className="border-t border-[#1f242d]">
                  <td className="p-3">
                    <p className="text-brand-soft">{r.mensaje?.contenido ?? "[Mensaje eliminado]"}</p>
                  </td>

                  <td className="p-3 text-gray-300">{r.motivo}</td>

                  <td className="p-3">
                    {r.usuario?.perfil?.nombre_publico ?? "Usuario"}
                  </td>

                  <td className="p-3 text-gray-400">
                    {new Date(r.creado_en).toLocaleString("es-CL")}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm ${
                        r.estado === "pendiente"
                          ? "bg-yellow-600 text-black"
                          : "bg-green-600 text-black"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>

                  <td className="p-3 flex gap-3">

                    {/* IR AL MENSAJE */}
                    <Link
                      href={`/comunidad/${r.mensaje?.tema_id}`}
                      className="text-brand-accent underline"
                    >
                      Ver mensaje
                    </Link>

                    {/* RESOLVER */}
                    {r.estado === "pendiente" && (
                      <button
                        onClick={() => resolverReporte(r.id)}
                        className="px-3 py-1 bg-green-600 rounded-lg text-black"
                      >
                        Marcar resuelto
                      </button>
                    )}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
