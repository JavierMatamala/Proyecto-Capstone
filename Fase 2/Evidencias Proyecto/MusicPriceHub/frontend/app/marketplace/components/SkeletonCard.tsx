export default function SkeletonCard() {
  return (
    <div className="bg-brand-card rounded-xl shadow overflow-hidden animate-pulse">
      {/* Imagen */}
      <div className="w-full h-48 bg-page-soft" />

      {/* Contenido */}
      <div className="p-4">
        <div className="h-4 bg-page-soft rounded mb-2 w-3/4" />
        <div className="h-4 bg-page-soft rounded mb-4 w-1/2" />
        <div className="h-10 bg-page-soft rounded w-full" />
      </div>
    </div>
  );
}
