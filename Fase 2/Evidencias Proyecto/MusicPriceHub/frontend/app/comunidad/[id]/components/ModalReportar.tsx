"use client";

import { useState } from "react";

export default function ModalReportar({ visible, onClose, onSubmit }: any) {
  const [motivo, setMotivo] = useState("");

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111318] p-6 rounded-xl w-full max-w-md border border-[#1f242d]">
        <h2 className="text-lg font-semibold text-page mb-4">Reportar mensaje</h2>

        <textarea
          rows={4}
          className="w-full bg-[#1a1d24] p-3 text-page rounded-lg"
          placeholder="Describe el motivo del reporte"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            Cancelar
          </button>

          <button
            onClick={() => onSubmit(motivo)}
            className="px-4 py-2 bg-red-500 rounded-lg text-white"
          >
            Enviar reporte
          </button>
        </div>
      </div>
    </div>
  );
}
