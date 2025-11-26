import { User, CornerDownRight } from "lucide-react";

export default function RespuestaCard({ respuesta }: any) {
  const eliminado = respuesta.eliminado;

  return (
    <div className={`p-4 rounded-xl border ${eliminado ? "bg-[#15171c] border-[#292d33] opacity-70" : "bg-[#0f1115] border-[#1f242d]"}`}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
          <User className="w-5 h-5 text-brand-accent" />
        </div>
        <div>
          <p className="text-sm text-brand-accent font-semibold">
            {respuesta.usuario?.nombre_publico || respuesta.usuario}
          </p>
          <p className="text-xs text-page-soft">{respuesta.creado_en}</p>
        </div>
      </div>

      {/* Contenido */}
      <p className={`leading-relaxed ${eliminado ? "text-page-soft italic" : "text-page"}`}>
        {respuesta.contenido}
      </p>

      {!eliminado && (
        <button className="mt-3 flex items-center gap-1 text-brand-accent text-sm hover:underline">
          <CornerDownRight size={16} />
          Responder
        </button>
      )}
    </div>
  );
}
