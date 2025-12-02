"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistorialItem {
  id: string;
  precio_centavos: number;
  moneda: string;
  fecha: string;
  tienda: string;
}

export default function HistorialPrecios({ data }: { data: HistorialItem[] }) {

  const formatoCLP = (v: number) =>
    (v).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="precio_centavos"
            stroke="#FBBF24"
            strokeWidth={2}
          />

          <XAxis
            dataKey="fecha"
            tickFormatter={(d) => new Date(d).toLocaleDateString("es-CL")}
          />

          <YAxis tickFormatter={(v) => formatoCLP(v)} />

          <Tooltip formatter={(v: number) => formatoCLP(v)} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
