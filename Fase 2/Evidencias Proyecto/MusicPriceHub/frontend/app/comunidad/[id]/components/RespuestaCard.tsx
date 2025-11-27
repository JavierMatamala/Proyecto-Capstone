import { User, CornerDownRight, Flag } from "lucide-react";

export default function RespuestaCard({ respuesta, onResponder, onLike, onReport }: any) {
  return (
    <div className="bg-[#111318] border border-[#1f242d] p-4 rounded-xl">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-brand-accent font-semibold">
            {respuesta.usuario?.nombre_publico || "Usuario"}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(respuesta.creado_en).toLocaleString("es-CL")}
          </span>
        </div>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">

          {/* LIKE */}
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-sm hover:text-brand-accent cursor-pointer"
          >
            <span className={respuesta.me_gusta ? "text-brand-accent" : "text-gray-400"}>
              ❤️
            </span>
            <span className="text-gray-400">{respuesta.likes || 0}</span>
          </button>

          {/* REPORTAR */}
          <button
            onClick={onReport}
            className="text-gray-400 hover:text-red-400 cursor-pointer"
            title="Reportar mensaje"
          >
            <Flag size={18} />
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <p className="mt-2">
        {respuesta.eliminado ? "[mensaje eliminado]" : respuesta.contenido}
      </p>

      {/* RESPONDER */}
      {!respuesta.eliminado && (
        <button
          onClick={() => onResponder(respuesta.id)}
          className="mt-3 text-brand-accent text-sm hover:underline"
        >
          ↳ Responder
        </button>
      )}
    </div>
  );
}