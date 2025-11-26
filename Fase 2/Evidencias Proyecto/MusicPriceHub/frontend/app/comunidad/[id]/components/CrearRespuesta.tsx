"use client";

import { useState } from "react";

export default function CrearRespuesta({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    if (!texto.trim()) return;
    onSubmit(texto);
    setTexto("");
  };

  return (
    <div className="bg-[#0f1115] border border-[#1f242d] p-4 rounded-xl">
      <textarea
        className="w-full bg-[#1a1d24] text-page p-3 rounded-lg outline-none"
        rows={3}
        placeholder="Escribe tu respuesta..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button
        onClick={enviar}
        className="mt-3 px-4 py-2 bg-brand-accent text-[#020617] rounded-lg font-semibold hover:bg-brand-accent-soft transition"
      >
        Responder
      </button>
    </div>
  );
}
