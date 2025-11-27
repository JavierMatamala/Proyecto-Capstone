export function guardarSesion(token: string, usuario: any) {
  localStorage.setItem("access_token", token);

  localStorage.setItem(
    "usuario",
    JSON.stringify({
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      avatar_url: usuario.avatar_url ?? "",
      es_admin: usuario.es_admin === true,
    })
  );
}

export function cerrarSesion() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("usuario");
}