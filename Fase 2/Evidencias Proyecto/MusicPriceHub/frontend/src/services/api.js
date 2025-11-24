import axios from "axios";

// 🌍 URL del backend en Render
const API_URL = "http://127.0.0.1:8000";


// Instancia base de Axios
export const api = axios.create({
  baseURL: API_URL,
});

// === Endpoints principales ===

// Obtener todos los productos
export async function getProductos() {
  const response = await fetch(`${API_URL}/api/productos/`);
  if (!response.ok) {
    throw new Error("Error en la API");
  }
  return await response.json();
}

// Crear producto nuevo
export const createProducto = async (producto) => {
  const response = await api.post("/api/productos/", producto);
  return response.data;
};

// Obtener historial de precios
export const getHistorial = async (productoId) => {
  const response = await api.get(`/api/historial/${productoId}`);
  return response.data;
};

// Obtener alertas
export const getAlertas = async () => {
  const response = await api.get("/api/alertas/");
  return response.data;
};

// Crear alerta
export const createAlerta = async (alerta) => {
  const response = await api.post("/api/alertas/", alerta);
  return response.data;
};


// ===============================
// MARKETPLACE – LISTAR PUBLICACIONES
// GET /mercado/publicaciones
// ===============================
export async function getPublicacionesMercado(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.q) params.append("q", filtros.q);
  if (filtros.ciudad) params.append("ciudad", filtros.ciudad);

  const query = params.toString();
  const url = `${API_URL}/mercado/publicaciones${query ? `?${query}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Error al obtener las publicaciones del marketplace.");
  }

  return await res.json();
}

// ===============================
// MARKETPLACE – CREAR PUBLICACIÓN
// POST /mercado/publicaciones
// ===============================
export async function crearPublicacionMercado({
  titulo,
  descripcion,
  precioCLP,
  ciudad,
}) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Debes iniciar sesión para publicar.");

  const limpio = (precioCLP || "").replace(/\./g, "").replace(/,/g, "").trim();
  const valor = Number(limpio);

  const body = {
    titulo,
    descripcion,
    producto_id: null,
    precio_centavos: valor * 100,
    moneda: "CLP",
    ciudad,
    imagenes: [],
  };

  const res = await fetch(`${API_URL}/mercado/publicaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al crear la publicación.");
  }

  return await res.json();
}

// ===============================
// MARKETPLACE – SUBIR IMÁGENES
// POST /mercado/publicaciones/{id}/imagenes
// ===============================
export async function subirImagenesPublicacion(publicacionId, archivos) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Debes iniciar sesión para subir imágenes.");

  const formData = new FormData();
  archivos.forEach((file) => formData.append("archivos", file));

  const res = await fetch(
    `${API_URL}/mercado/publicaciones/${publicacionId}/imagenes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al subir imágenes.");
  }

  return await res.json();
}
