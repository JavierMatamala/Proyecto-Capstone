export default function TemaCard({ tema }: any) {
  return (
    <div className="bg-[#111318] border border-[#1f242d] p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-brand-accent mb-3">
        {tema.titulo}
      </h1>

      <p className="text-page-soft text-sm mb-4">
        Publicado por <span className="text-brand-accent">{tema.usuario}</span> · {(new Date(tema.fecha).toLocaleString("es-CL", {
                    timeZone: "America/Santiago",
                  }))}
      </p>

      <p className="text-page leading-relaxed">{tema.contenido}</p>
    </div>
  );
}
