"use client";

import { useEffect, useState } from "react";
import {ChatWidget} from "../chat/chat";
const API_URL = "http://127.0.0.1:8000";

// =========================
//  DATOS REGIONES Y COMUNAS
// =========================
const REGIONES: Record<string, string[]> = {
  "Región Metropolitana": ["Santiago", "Maipú", "Puente Alto", "Providencia", "Ñuñoa"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Concón"],
  "Biobío": ["Concepción", "Talcahuano", "Hualpén", "Chiguayante", "Coronel"],
  "Coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Vicuña", "Illapel"],
  "Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol"],
};

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Avatar
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  // FORM NOMBRE
  const [nombrePublico, setNombrePublico] = useState("");

  // FORM REGION / COMUNA
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");

  // FORM CONTRASEÑA
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mensaje, setMensaje] = useState("");

  // ===========================
  // MANEJAR SUBIDA DE AVATAR
  // ===========================
  function handleAvatarChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setAvatar(reader.result as string); // Base64 lista para backend
    };

    reader.readAsDataURL(file);
  }

  // ===========================
  //  CARGAR PERFIL
  // ===========================
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      setMensaje("⚠ Debes iniciar sesión para ver tu perfil.");
      return;
    }

    fetch(`${API_URL}/perfil/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null);
          throw err?.detail ?? "No se pudo cargar el perfil.";
        }
        return r.json();
      })
      .then((data) => {
        setPerfil(data);
        setNombrePublico(data.nombre_publico ?? "");
        setRegion(data.region ?? "");
        setComuna(data.comuna ?? "");
        setAvatar(data.avatar_url ?? "");
        setAvatarPreview(data.avatar_url ?? "");
      })
      .catch((err) => {
        setMensaje(
          typeof err === "string" ? err : "No se pudo cargar el perfil."
        );
      })
      .finally(() => setLoading(false));
  }, []);


  // ===========================
  //  ACTUALIZAR PERFIL
  // ===========================
async function actualizarPerfil(e: any) {
  e.preventDefault();
  setMensaje("");

  const token = localStorage.getItem("access_token");
  if (!token) {
    setMensaje("⚠ No hay token. Debes iniciar sesión nuevamente.");
    return;
    
  }

  const response = await fetch(`${API_URL}/perfil/actualizar`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre_publico: nombrePublico,
        region: region,
        comuna: comuna,
        avatar_url: avatar, // <--- IMPORTANTE
      }),
    }
  );

  if (!response.ok) {
    setMensaje("⚠ No se pudo actualizar el perfil.");
    return;
  }

  setMensaje("✔ Perfil actualizado correctamente.");
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");

localStorage.setItem(
  "usuario",
  JSON.stringify({
    ...usuarioActual,
    nombre: nombrePublico,
    region,
    comuna,
    avatar_url: avatar, // si también guardas avatar en backend
  })
);
  setTimeout(() => {
  window.location.href = "/";
}, 800);
}

  // ===========================
  //  CAMBIAR CONTRASEÑA
  // ===========================
  // CAMBIAR CONTRASEÑA
async function cambiarContrasena(e: any) {
  e.preventDefault();
  setMensaje("");

  if (nueva !== confirmar) {
    setMensaje("⚠ Las contraseñas no coinciden.");
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) return;

  const response = await fetch(`${API_URL}/perfil/cambiar_contrasena`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contrasena_actual: actual,
      contrasena_nueva: nueva,
    }),
  });

  if (!response.ok) {
    setMensaje("⚠ No se pudo cambiar la contraseña.");
    return;
  }

  setMensaje("✔ Contraseña cambiada correctamente.");
  setActual("");
  setNueva("");
  setConfirmar("");
}

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>{mensaje || "No hay perfil disponible."}</p>
      </main>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-28 px-4 text-white">
      <h1 className="text-3xl font-semibold mb-6 text-brand-accent">Mi Perfil</h1>

      {mensaje && (
        <p className="mb-3 text-sm text-yellow-400">
          {mensaje}
        </p>
      )}

      {/* ===========================
          FORMULARIO PERFIL
      ============================ */}
      <div className="bg-[#0f1115] border border-[#1f242d] rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-brand-accent">
          Información del Perfil
        </h2>

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarPreview || "/default-avatar.png"}
            className="w-32 h-32 rounded-full object-cover border-4 border-brand-accent-soft shadow"
            alt="avatar"
          />

          <label className="mt-3 px-4 py-2 bg-brand-accent text-[#020617] rounded cursor-pointer font-semibold hover:bg-brand-accent-soft">
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={actualizarPerfil} className="flex flex-col gap-4">

          {/* Nombre público */}
          <input
            type="text"
            value={nombrePublico}
            onChange={(e) => setNombrePublico(e.target.value)}
            className="p-2 bg-[#1a1d22] text-white rounded border border-[#2c323d]"
          />

          {/* Región */}
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setComuna(""); // Reiniciar comuna
            }}
            className="p-2 bg-[#1a1d22] text-white rounded border border-[#2c323d]"
          >
            <option value="">Selecciona región</option>
            {Object.keys(REGIONES).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Comuna */}
          <select
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            disabled={!region}
            className="p-2 bg-[#1a1d22] text-white rounded border border-[#2c323d]"
          >
            <option value="">Selecciona comuna</option>

            {region &&
              REGIONES[region].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          <button
            type="submit"
            className="bg-brand-accent text-[#020617] px-4 py-2 rounded font-semibold"
          >
            Guardar Cambios
          </button>
        </form>
      </div>

      {/* ===========================
          FORMULARIO CONTRASEÑA
      ============================ */}
      <div className="bg-[#0f1115] border border-[#1f242d] rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-brand-accent">
          Cambiar Contraseña
        </h2>

        <form onSubmit={cambiarContrasena} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className="p-2 bg-[#1a1d22] text-white rounded border border-[#2c323d]"
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className="p-2 bg-[#1a1d22] text-white rounded border border-[#2c323d]"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="p-2 bg-[#1a1d22] text-white rounded border border-[#2c323d]"
          />

          <button
            type="submit"
            className="bg-brand-accent text-[#020617] px-4 py-2 rounded font-semibold"
          >
            Cambiar Contraseña
          </button>
        </form>
      </div>
      <ChatWidget />
    </div>
  );
}
