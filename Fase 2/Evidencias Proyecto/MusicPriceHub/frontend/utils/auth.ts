// utils/auth.ts

export function guardarSesion(token: string, usuario: any) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function obtenerUsuario() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("usuario");
  return u ? JSON.parse(u) : null;
}

export function obtenerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function cerrarSesion() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("usuario");
  window.location.href = "/";
}
