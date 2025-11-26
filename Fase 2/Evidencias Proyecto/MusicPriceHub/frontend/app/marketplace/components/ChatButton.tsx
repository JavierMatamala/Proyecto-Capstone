"use client";

import { MessageCircle } from "lucide-react";

type ChatButtonProps = {
  vendedorId: string;          // ID del usuario vendedor
  publicacionId: string;       // ID de la publicación
  onClick?: () => void;        // Acción opcional
};

export default function ChatButton({
  vendedorId,
  publicacionId,
  onClick,
}: ChatButtonProps) {
  
  // Más adelante verificaremos:
  // - si el usuario está logeado
  // - si ya existe conversación
  // - redirección automática

  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6
        flex items-center gap-2
        bg-brand-accent text-[#020617]
        px-5 py-3 rounded-full shadow-lg
        font-semibold transition
        hover:bg-brand-accent-soft
        z-50
      "
    >
      <MessageCircle className="h-5 w-5" />
      Chat
    </button>
  );
}
