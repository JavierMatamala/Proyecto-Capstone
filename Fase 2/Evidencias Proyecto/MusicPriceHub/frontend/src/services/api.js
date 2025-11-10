import axios from "axios";

// 🌍 URL del backend en Render
const API_URL = "https://musicpricehub.onrender.com";

// Instancia base de Axios
export const api = axios.create({
  baseURL: API_URL,
});

// === Endpoints principales ===

// Obtener todos los productos
export async function getProductos() {
  const response = await fetch("https://musicpricehub.onrender.com/api/productos/");
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
