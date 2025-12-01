"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type ChatButtonProps = {
  vendedorId: string;
  publicacionId: string;
  vendedor: any;
  publicacionNombre: string;
  onClick?: () => void;
};

export default function ChatButton({
  vendedorId,
  publicacionId,
  vendedor,
  publicacionNombre,
  onClick,
}: ChatButtonProps) {
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [usuario, setUsuario] = useState<{ id?: string; nombre?: string }>({});

  // Cargar usuario
  useEffect(() => {
    try {
      const stored = localStorage.getItem("usuario");
      if (stored) setUsuario(JSON.parse(stored));
    } catch (err) {
      console.error("Error leyendo usuario de localStorage:", err);
    }
  }, []);
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  async function handleToggle() {
    const dataUsuario = localStorage.getItem("usuario");
    const usuario = dataUsuario ? JSON.parse(dataUsuario) : null;
    setOpen((s) => !s);
    if (onClick) onClick();
    console.log(vendedor);
    // Obtener mi id de usuario
    // Verificar si existe chat, si no, crear uno nuevo
    const resp = await fetch(`https://musicpricehub.onrender.com/api/chat/conversaciones/usuario/create/${usuario.id}/${vendedor.id}/${publicacionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    const data = await resp.json();
    let mensaje = `Hola, estoy interesado en tu publicación sobre ${publicacionNombre}.`;
    const bodyData = {
      conversacion_id: data.conversacion.id,
      remitente_id: usuario.id,
      receptor_id: vendedorId,
      contenido: mensaje,
    };

    window.dispatchEvent(
      new CustomEvent("abrir-chat", {
        detail: {
          data : bodyData
        },
      })
    );
  }

  return (
  <>
    {usuario.id && usuario.id !== vendedorId && (
      <button
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={`chat-panel-${publicacionId}`}
        className="
          bottom-2 right-2
          flex items-center gap-2
          bg-[#155efc] text-[#020617]
          w-45
          px-5 py-3 rounded-full shadow-lg
          font-semibold transition
          hover:bg-brand-accent-soft
        "
      >
        <MessageCircle className="h-5 w-5" />
        Enviar mensaje
      </button>
    )}
  </>
);
}