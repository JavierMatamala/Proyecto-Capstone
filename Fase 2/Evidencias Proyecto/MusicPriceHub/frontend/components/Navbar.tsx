"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Guitar,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";

type Theme = "light" | "dark";

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  // NEW -------------------------------
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("mph-theme") as Theme | null;
    const initial = stored ?? "dark";

    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    // NEW: cargar usuario desde localStorage
const u = window.localStorage.getItem("usuario");
if (u) {
  const data = JSON.parse(u);
  setUsuario({
    ...data,
    es_admin: data.es_admin ?? false,
  });
}
  }, []);

  // NEW: cerrar sesión
  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("access_token");
    setUsuario(null);
    window.location.href = "/"; // refrescar  
  };
  // -----------------------------------

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

    window.localStorage.setItem("mph-theme", next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <header className="w-full bg-brand-header text-page-foreground shadow-md relative z-50">

      {/* NAV SUPERIOR */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">

        {/* IZQUIERDA: Hamburguesa + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-brand-accent-soft/40 p-2"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Guitar className="h-7 w-7 text-brand-accent" /> 
            <span className="text-lg font-semibold text-white">
              MusicPriceHub
            </span>
          </Link>
        </div>

        {/* BUSCADOR DESKTOP */}
        <div className="hidden flex-1 items-center rounded-md bg-page px-3 py-1 shadow-inner sm:flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar instrumentos o marcas..."
            className="h-8 w-full bg-transparent text-sm text-page placeholder:text-page/60 outline-none"
          />
          <Search className="h-4 w-4 text-brand-accent" />
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-accent-soft/60 bg-page/70 text-brand-accent shadow-sm transition hover:bg-brand-accent-soft/10"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* NEW: si hay usuario mostrar saludo + logout */}
          {usuario ? (
  <div className="flex items-center gap-3 text-white">

    {/* Avatar → redirige al perfil */}
    <Link href="/perfil">
      {usuario.avatar_url ? (
        <img
          src={usuario.avatar_url}
          className="w-9 h-9 rounded-full object-cover border border-brand-accent-soft cursor-pointer hover:opacity-80 transition"
          alt="avatar"
        />
      ) : (
        <UserCircle
          className="w-9 h-9 text-brand-accent cursor-pointer hover:opacity-80 transition"
        />
      )}
    </Link>

    {/* Texto saludo */}
    <span className="hidden lg:inline">
      Hola, {usuario.nombre}
    </span>

    {/* Botón cerrar sesión */}
    <button
      onClick={logout}
      className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-red-600"
    >
      Cerrar sesión
    </button>
  </div>
) : (
  <Link
    href="/login"
    className="hidden rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-[#020617] shadow hover:bg-brand-accent-soft lg:inline-block"
  >
    Iniciar Sesión
  </Link>
)}
        </div>
      </div>

      {/* BUSCADOR MOBILE */}
      <div className="sm:hidden px-4 py-2 bg-brand-header">
        <div className="flex items-center rounded-md bg-page px-3 py-2 shadow-inner">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar instrumentos..."
            className="w-full text-sm bg-transparent outline-none text-page placeholder:text-page/60"
          />
          <Search className="h-4 w-4 text-brand-accent" />
        </div>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* PANEL LATERAL */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-brand-header shadow-xl
                    border-r border-brand-accent-soft/30 transform transition-transform duration-300
                    ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-accent-soft/20">
          <div className="flex items-center gap-2">
            <Guitar className="h-5 w-5 text-brand-accent" />
            <span className="text-lg font-semibold text-white">
              Menú
            </span>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            className="p-1 rounded hover:bg-black/10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <nav className="flex flex-col px-4 gap-2 text-sm mt-2">
          <Link href="/" className="rounded px-2 py-1 hover:bg-page/20 text-white">
            Inicio
          </Link>

          <Link href="/marketplace" className="rounded px-2 py-1 hover:bg-page/20 text-white">
            Marketplace
          </Link>

          <Link href="/comunidad" className="rounded px-2 py-1 hover:bg-page/20 text-white">
            Comunidad
          </Link>

          <Link href="/historial" className="rounded px-2 py-1 hover:bg-page/20 text-white">
            Historial de precios
          </Link>

            {usuario?.es_admin && (
              <Link
                href="/comunidad/moderar"
                className="rounded px-2 py-1 hover:bg-page/20 text-white"
              >
                Moderar reportes
              </Link>
            )}



          {!usuario && (
            <Link
              href="/login"
              className="mt-3 rounded border border-brand-accent-soft/50 px-3 py-1 text-center text-white"
            >
              Iniciar Sesión
            </Link>
          )}

          {usuario && (
            <button
              onClick={logout}
              className="mt-3 rounded bg-red-500 text-white px-3 py-1"
            >
              Cerrar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
