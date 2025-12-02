import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

interface OtroUsuario {
  id: string;
  nombre: string;
}

interface Chat {
  conversacion_id: string;
  enviado_en: string;
  otro_usuario: OtroUsuario;
  publicacion_id: string;
  ultimo_mensaje: string;
  notificacion?: boolean;
}

interface VentanaChat extends Chat {
  id: string;
  abierto: boolean;
}

interface MensajeWS {
  id: string;
  contenido: string;
  remitente_id: string;
  receptor_id: string;
  leido: boolean;
  enviado_en: string;
}

interface Notificacion {
  tipo: string;
  mensaje: string;
  conversacion_id?: string;
}

// CONFIGURACIÓN DE DIMENSIONES
const BOTON_WIDTH = 64;
const LISTA_WIDTH = 256;
const CHAT_WIDGET_RIGHT_MARGIN = 24;
const VENTANA_WIDTH = 288;
const ESPACIO_ENTRE_VENTANAS = 12;

export const ChatWidget: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [ventanas, setVentanas] = useState<VentanaChat[]>([]);
  const [mostrarLista, setMostrarLista] = useState(false);
  const wsMap = useRef<{ [conversacionId: string]: WebSocket }>({});
  const [mensajes, setMensajes] = useState<{ [conversacionId: string]: MensajeWS[] }>({});
  const wsNotification = useRef<WebSocket | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [usuario, setUsuario] = useState<{ id?: string; nombre?: string }>({});
  const [data, setData] = useState<any>(null);
  const colaMensajes = useRef<{ [id: string]: MensajeWS[] }>({});

  // Cargar usuario y evento abrir-chat
  useEffect(() => {
    try {
      const stored = localStorage.getItem("usuario");
      if (stored) setUsuario(JSON.parse(stored));
    } catch (err) {
      console.error("Error leyendo usuario de localStorage:", err);
    }

    const handler = (e: any) => setData(e.detail);
    window.addEventListener("abrir-chat", handler);
    return () => window.removeEventListener("abrir-chat", handler);
  }, []);

  // Conexión a notificaciones
  useEffect(() => {
    if (!usuario.id) return;

    const wsUrl = `wss:musicpricehub.onrender.com/api/chat/ws/notifications/${usuario.id}`;
    wsNotification.current = new WebSocket(wsUrl);

    wsNotification.current.onopen = () => console.log("Conectado a notificaciones");

    wsNotification.current.onmessage = (event) => {
      const data: Notificacion = JSON.parse(event.data);
      console.log("Notificación recibida:", data);
      setNotificaciones((prev) => [...prev, data]);
    };

    wsNotification.current.onclose = () => console.log("Desconectado de notificaciones");

    return () => wsNotification.current?.close();
  }, [usuario.id]);

  // Cargar chats desde API y abrir chat si viene data
  useEffect(() => {
    if (!usuario.id) return;

    const cargarChats = async () => {
      try {
        const resp = await fetch(
          `https://musicpricehub.onrender.com/api/chat/conversaciones/usuario/${usuario.id}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const dataChats: Chat[] = await resp.json();
        setChats(dataChats);
        if (data?.data?.conversacion_id) {
            console.log("chats-----------------");
            console.log(chats);
            console.log("data-----------------");
            console.log(data);
          const chat = dataChats.find(
            (c) => c.conversacion_id === data.data.conversacion_id
          );
          if (chat) {
            abrirChat(chat, data.data);
          } 
          setData(null);
        }
      } catch (error) {
        console.error("Error al cargar chats:", error);
      }
    };

    cargarChats();
  }, [usuario.id, data]);


  // Obtener mensajes
  const obtenerMensajes = async (conversacion_id: string) => {
    if (!usuario.id) return;
    try {
      const resp = await fetch(
        `https://musicpricehub.onrender.com/api/chat/mensajes/${conversacion_id}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data: MensajeWS[] = await resp.json();
      setMensajes((prev) => ({
        ...prev,
        [conversacion_id]: data,
      }));
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    }
  };

  // Conectar chat WebSocket
  const conectarChat = (conversacionId: string) => {
    if (!usuario.id) return;
    if (wsMap.current[conversacionId]) return;

    const wsUrl = `wss:musicpricehub.onrender.com/api/chat/ws/chat/${conversacionId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Conectado a ${conversacionId}`);

      // Enviar mensajes en cola
      const cola = colaMensajes.current[conversacionId] || [];
      cola.forEach((msg) => ws.send(JSON.stringify(msg)));
      colaMensajes.current[conversacionId] = [];
    };

    ws.onmessage = (event) => {
      const data: MensajeWS = JSON.parse(event.data);
      setMensajes((prev) => ({
        ...prev,
        [conversacionId]: [...(prev[conversacionId] || []), data],
      }));
    };

    ws.onclose = () => console.log(`Desconectado de ${conversacionId}`);

    wsMap.current[conversacionId] = ws;
  };

  const desconectarChat = (conversacionId: string) => {
    const ws = wsMap.current[conversacionId];
    if (ws) {
      ws.close();
      delete wsMap.current[conversacionId];
      console.log(`Desconectado de ${conversacionId}`);
    }
  };

  // Enviar mensaje
  const enviarMensaje = (conversacionId: string, receptorId: string) => {
    const input = document.getElementById(
      `input-${conversacionId}`
    ) as HTMLInputElement;
    const contenido = input.value.trim();
    if (!contenido) return;

    const ws = wsMap.current[conversacionId];
    const mensaje: MensajeWS = {
      id: Math.random().toString(36).substr(2, 9),
      contenido,
      remitente_id: usuario.id!,
      receptor_id: receptorId,
      leido: false,
      enviado_en: new Date().toISOString(),
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(mensaje));
    } else {
      if (!colaMensajes.current[conversacionId])
        colaMensajes.current[conversacionId] = [];
      colaMensajes.current[conversacionId].push(mensaje);
    }

    input.value = "";
  };

  // Abrir ventana
  const abrirChat = (chat: Chat, mensaje?: MensajeWS) => {
    const existe = ventanas.some(
      (c) => c.conversacion_id === chat.conversacion_id
    );
    if (existe) {
      if(mensaje){  
        const ws = wsMap.current[chat.conversacion_id];
      
        if (ws && ws.readyState === WebSocket.OPEN) {
          const mensajeSend: MensajeWS = {
            id: Math.random().toString(36).substr(2, 9),
            contenido: mensaje.contenido,
            remitente_id: mensaje.remitente_id,
            receptor_id: mensaje.receptor_id,
            leido: false,
            enviado_en: new Date().toISOString(),
          };
          ws.send(JSON.stringify(mensaje));
        } 
        return;
      }else{
        return;
      }
    };

    obtenerMensajes(chat.conversacion_id);

    if (!colaMensajes.current[chat.conversacion_id])
      colaMensajes.current[chat.conversacion_id] = [];

    if (mensaje) {
      // Solo encolamos los mensajes que vienen del evento
      colaMensajes.current[chat.conversacion_id].push(mensaje);
    }

    conectarChat(chat.conversacion_id);

    setChats((prev) =>
      prev.map((c) =>
        c.conversacion_id === chat.conversacion_id
          ? { ...c, notificacion: false }
          : c
      )
    );

    setVentanas((prev) => [
      ...prev,
      { ...chat, id: chat.conversacion_id, abierto: true },
    ]);
  };

  const cerrarVentana = (id: string) => {
    desconectarChat(id);
    setVentanas((prev) => prev.filter((v) => v.id !== id));
    setMensajes((prev) => ({ ...prev, [id]: [] }));
  };

  const toggleVentana = (id: string) => {
    setVentanas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, abierto: !v.abierto } : v))
    );
  };

  const totalNotificaciones = chats.filter((c) => c.notificacion).length;

return (
  <>
    {/* Contenedor flotante de chats */}
    {usuario.id && (
      <div className="fixed bottom-0 right-6 z-50 flex flex-col items-end">
        {/* Lista de chats */}
        {mostrarLista && (
          <div className="mb-2 bg-[#1e293b] rounded-lg shadow-xl p-3 w-64 flex flex-col space-y-0 border border-[#2d3a4e]">
            {chats.map((chat) => (
              <button
                key={chat.conversacion_id}
                onClick={() => abrirChat(chat)}
                className="flex items-center justify-between p-1 rounded-lg hover:bg-[#2d3a4e] transition-colors text-white font-medium group text-sm"
              >
                <span>{chat.otro_usuario.nombre}</span>
                {chat.notificacion && (
                  <span className="bg-red-500 w-2 h-2 rounded-full ring-1 ring-white"></span>
                )}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-700 mt-2">
              <p className="text-xs text-gray-400 text-center">
                Abrir lista de chats completa
              </p>
            </div>
          </div>
        )}

        {/* Botón flotante */}
        <button
          onClick={() => setMostrarLista(!mostrarLista)}
          className="relative h-12 px-4 bg-blue-600 rounded-xl flex items-center text-white shadow-xl hover:bg-blue-700 transition-colors space-x-2"
        >
          <MessageCircle className="h-8 w-8" />
          {totalNotificaciones > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white ring-2 ring-white">
              {totalNotificaciones}
            </span>
          )}
        </button>
      </div>
    )}

    {/* Ventanas flotantes de chat */}
    {ventanas.map((chat, index) => {
      const widgetVisualWidth = mostrarLista ? LISTA_WIDTH : BOTON_WIDTH;
      const baseRightOffset = CHAT_WIDGET_RIGHT_MARGIN + widgetVisualWidth + 16;
      const rightPosition =
        baseRightOffset + VENTANA_WIDTH * index + ESPACIO_ENTRE_VENTANAS * index;

      return (
        <div
          key={chat.id}
          style={{ right: `${rightPosition}px` }}
          className={`fixed bottom-0 z-40 bg-[#121b2f] text-white rounded-lg shadow-lg flex flex-col w-72 ${
            chat.abierto ? "h-[460px]" : "h-16"
          } transition-all duration-300 ease-in-out overflow-hidden`}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2 bg-[#1e293b] rounded-t-lg cursor-pointer border-b border-[#2d3a4e]"
            onClick={() => toggleVentana(chat.id)}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  chat.id === "1"
                    ? "bg-purple-600"
                    : chat.id === "2"
                    ? "bg-indigo-600"
                    : "bg-teal-600"
                }`}
              >
                {chat.otro_usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-white">{chat.otro_usuario.nombre}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cerrarVentana(chat.id);
              }}
              className="text-gray-400 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* Contenido */}
          {chat.abierto && (
            <div className="flex flex-col px-4 pt-4 pb-2 flex-1 overflow-y-auto justify-between scroll-custom">
              <div className="flex flex-col space-y-3 overflow-y-auto text-sm pr-2">
                {mensajes[chat.conversacion_id]?.map((msg) => {
                  if (!msg.contenido) return null;
                  return msg.remitente_id === usuario.id ? (
                    <div
                      key={msg.id}
                      className="bg-blue-600 p-3 rounded-xl rounded-tr-sm self-end max-w-[85%] text-white"
                    >
                      <p>{msg.contenido}</p>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className="bg-[#2d3a4e] p-3 rounded-xl rounded-tl-sm self-start max-w-[85%] text-gray-100"
                    >
                      <p>{msg.contenido}</p>
                    </div>
                  );
                })}
              </div>

              {/* Input de mensaje */}
              <div className="mt-4">
                <div className="flex items-center bg-[#1e293b] rounded-xl p-0.5 border border-[#2d3a4e]">
                  <input
                    id={`input-${chat.conversacion_id}`}
                    type="text"
                    placeholder="Escribe un mensaje..."
                    className="flex-1 py-1.5 px-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      enviarMensaje(chat.conversacion_id, chat.otro_usuario.id);
                    }}
                    className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 -rotate-45 transform -mt-1 -mr-1"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    })}
  </>
);
};
