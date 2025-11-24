import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://musicpricehub.onrender.com";

export default function PublicacionDetalle() {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [conversacion, setConversacion] = useState(null);

  let usuarioActual = null;

const token = localStorage.getItem("access_token");
if (token) {
  const decoded = jwtDecode(token);
  usuarioActual = decoded.sub;   // <- tu backend guarda el usuario aquí
}

  useEffect(() => {
    cargarPublicacion();
    verificarConversacion();
  }, []);

  // ============================
  // CARGAR PUBLICACION (ruta correcta)
  // ============================
  const cargarPublicacion = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/mercado/publicaciones/${id}`
      );
      setPublicacion(res.data);
    } catch (err) {
      console.error("Error al cargar publicación: ", err);
    }
  };

  // ============================
  // VERIFICAR CONVERSACIÓN (ruta correcta)
  // ============================
const verificarConversacion = async () => {
  try {
    if (!usuarioActual) return;

    const res = await axios.get(
      `http://localhost:8000/api/chat/conversaciones/usuario/${usuarioActual}`
    );

    const lista = res.data;

    const conv = lista.find(c => c.publicacion_id === id);

    if (conv) {
      setConversacion(conv);
      cargarMensajes(conv.id);
    }
  } catch (err) {
    console.error("Error verificando conversación:", err);
  }
};

  // ============================
  // INICIAR CONVERSACIÓN
  // ============================
  const iniciarConversacion = async () => {
    try {
      const payload = {
      usuario1_id: usuarioActual,
      usuario2_id: publicacion.vendedor_id,
      publicacion_id: id,
    };

      const res = await axios.post(
        `${API_URL}/api/chat/conversacion/crear`,
        payload
      );

      setConversacion(res.data);
      cargarMensajes(res.data.id);

    } catch (err) {
      console.error("Error creando conversación: ", err);
    }
  };

  // ============================
  // CARGAR MENSAJES
  // ============================
  const cargarMensajes = async (conversacionId) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/chat/mensajes/${conversacionId}`
      );
      setMensajes(res.data);
    } catch (err) {
      console.error("Error cargando mensajes: ", err);
    }
  };

  // ============================
  // ENVIAR MENSAJE
  // ============================
  const enviarMensaje = async () => {
    if (!texto.trim()) return;

    try {
      const payload = {
        conversacion_id: conversacion.id,
        remitente_id: usuarioActual,
        receptor_id: publicacion.vendedor_id,
        contenido: texto,
      };

      const res = await axios.post(
        `${API_URL}/api/chat/mensajes/enviar`,
        payload
      );

      setMensajes([...mensajes, res.data]);
      setTexto("");
    } catch (err) {
      console.error("Error enviando mensaje: ", err);
    }
  };

  // ============================
  // HTML
  // ============================
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-gray-100 min-h-screen">

      {/* IMAGEN PRINCIPAL */}
      <div className="md:col-span-7 bg-white p-4 rounded-xl shadow">
        {publicacion && (
          <img
            src={publicacion.imagenes?.[0]?.url_imagen
              ? `${API_URL}${publicacion.imagenes[0].url_imagen}`
              : "https://via.placeholder.com/600x400"}
            className="rounded-xl object-cover w-full h-[450px]"
          />
        )}
      </div>

      {/* INFORMACIÓN + CHAT */}
      <div className="md:col-span-5 flex flex-col gap-4">

        {/* INFORMACION */}
        <div className="bg-white p-4 rounded-xl shadow">
          {publicacion && (
            <>
              <h1 className="text-2xl font-bold">{publicacion.titulo}</h1>
              <p className="text-xl text-green-600 font-semibold mt-2">
                ${(publicacion.precio_centavos / 100).toLocaleString()}
              </p>

              <p className="mt-4 text-gray-700">{publicacion.descripcion}</p>

              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                onClick={iniciarConversacion}
              >
                Enviar mensaje al vendedor
              </button>
            </>
          )}
        </div>

        {/* CHAT */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col h-[350px]">
          <h2 className="text-lg font-semibold mb-2">Chat</h2>

          {/* LISTA DE MENSAJES */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded border">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`p-2 my-1 rounded-xl max-w-[75%] ${
                  m.remitente_id == usuarioActual
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200"
                }`}
              >
                {m.contenido}
              </div>
            ))}
          </div>

          {/* INPUT CHAT */}
          {conversacion ? (
            <div className="flex mt-2 gap-2">
              <input
                className="flex-1 p-2 border rounded-lg"
                placeholder="Escribe un mensaje..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 rounded-lg"
                onClick={enviarMensaje}
              >
                Enviar
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-2">
              Inicia una conversación para chatear.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
