"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export default function Filters({ onChange }: { onChange: (filtros: any) => void }) {
  const [texto, setTexto] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [rango, setRango] = useState(""); // nuevo
  const [orden, setOrden] = useState("");

  const aplicar = () => {
    let min = precioMin ? Number(precioMin) : null;
    let max = precioMax ? Number(precioMax) : null;

    // Si el usuario selecciona un rango predeterminado → sobreescribimos min/max
    if (rango !== "") {
      const [minR, maxR] = rango.split("-");

      min = minR !== "null" ? Number(minR) : null;
      max = maxR !== "null" ? Number(maxR) : null;
    }

    onChange({
      texto,
      precioMin: min,
      precioMax: max,
      orden,
    });
  };

  const limpiar = () => {
    setTexto("");
    setPrecioMin("");
    setPrecioMax("");
    setRango("");
    setOrden("");

    onChange({
      texto: "",
      precioMin: null,
      precioMax: null,
      orden: "",
    });
  };

  return (
    <div className="w-full bg-brand-header p-4 rounded-lg shadow mb-4 text-page">
      {/* TÍTULO */}
      <h3 className="text-lg font-semibold mb-3">Filtros</h3>

      {/* BÚSQUEDA */}
      <div className="flex items-center bg-page rounded-md px-3 py-2 shadow-inner mb-3">
        <Search className="h-4 w-4 text-brand-accent mr-2" />
        <input
          type="text"
          value={texto}
          placeholder="Buscar..."
          onChange={(e) => setTexto(e.target.value)}
          className="w-full bg-transparent outline-none text-page placeholder:text-page/60"
        />
      </div>

      {/* RANGO PREDETERMINADO */}
      <div className="mb-3">
        <label className="text-sm text-page-soft">Rango de precios</label>
        <select
          value={rango}
          onChange={(e) => setRango(e.target.value)}
          className="w-full mt-1 p-2 rounded bg-page text-page outline-none"
        >
          <option value="">Ingresar manualmente</option>
          <option value="0-50000">$0 - $50.000</option>
          <option value="50000-100000">$50.000 - $100.000</option>
          <option value="100000-300000">$100.000 - $300.000</option>
          <option value="300000-null">$300.000+</option>
        </select>
      </div>

      {/* RANGO MANUAL */}
      {rango === "" && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-page-soft">Precio Min</label>
            <input
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-page text-page outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-page-soft">Precio Max</label>
            <input
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-page text-page outline-none"
            />
          </div>
        </div>
      )}

      {/* ORDENAR */}
      <div className="mb-3">
        <label className="text-sm text-page-soft">Ordenar por</label>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full mt-1 p-2 rounded bg-page text-page outline-none"
        >
          <option value="">Sin orden</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a mayor</option>
          <option value="reciente">Más recientes</option>
        </select>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={aplicar}
          className="flex-1 bg-brand-accent text-[#020617] font-semibold py-2 rounded hover:bg-brand-accent-soft transition"
        >
          Aplicar
        </button>

        <button
          onClick={limpiar}
          className="flex items-center justify-center px-3 py-2 bg-black/20 hover:bg-black/30 rounded transition text-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
