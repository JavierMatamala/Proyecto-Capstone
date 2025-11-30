"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Menu,
  Guitar,
  MessagesSquare,
  ShoppingBag,
  Home,
  PlusCircle
} from "lucide-react";

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) {
      setUsuario(JSON.parse(u)); // contiene: id, correo, es_admin
    }
  }, []);

  return (
    <>
      {/* BOTÓN HAMBURGUESA */}
      <button
        className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition"
        onClick={() => setOpen(true)}
      >
        <Menu size={26} />
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* PANEL LATERAL */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#0F172A] 
          shadow-xl z-50 p-5 flex flex-col gap-6 transform
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Guitar className="text-brand-accent" />
            Menu
          </h2>

          <button
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* OPCIONES */}
        <nav className="flex flex-col gap-4 text-base">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:text-brand-accent">
            <Home size={20} /> Inicio
          </Link>

          <Link href="/marketplace" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:text-brand-accent">
            <ShoppingBag size={20} /> Marketplace
          </Link>

          <Link href="/comunidad" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:text-brand-accent">
            <MessagesSquare size={20} /> Comunidad
          </Link>

          {/* SOLO ADMIN */}
          {usuario?.es_admin && (
            <Link
              href="/producto/nuevo"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-brand-accent font-semibold hover:text-brand-accent/80"
            >
              <PlusCircle size={20} /> Agregar producto
            </Link>
          )}
        </nav>

        {/* INFORMACIÓN DEL USUARIO */}
        {usuario && (
          <p className="mt-auto text-xs opacity-70">
            Sesión iniciada como: <br />
            <span className="font-semibold">{usuario.correo}</span>
            {usuario.es_admin && (
              <span className="text-brand-accent font-bold"> (Admin)</span>
            )}
          </p>
        )}
      </div>
    </>
  );
}
