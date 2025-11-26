"use client";

import { useState } from "react";

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-brand-card rounded-xl flex items-center justify-center h-72 text-page-soft">
        Sin imágenes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="w-full h-72 rounded-xl overflow-hidden bg-brand-card flex items-center justify-center">
        <img
          src={images[active]}
          alt={`Imagen ${active + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`h-20 w-20 rounded-lg overflow-hidden border 
              ${index === active ? "border-brand-accent" : "border-transparent"}`}
          >
            <img
              src={img}
              alt="thumb"
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
