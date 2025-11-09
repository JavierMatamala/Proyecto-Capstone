import { useState } from "react";
import { MessageCircle, Heart, Send, User } from "lucide-react";

function Comunidad() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      autor: "Luis Martínez",
      contenido: "¿Alguien ha probado las guitarras Fender Player Series? Estoy pensando en comprar una 🎸",
      likes: 12,
      comentarios: 3,
    },
    {
      id: 2,
      autor: "Camila Soto",
      contenido: "Les recomiendo la tienda MusicPro, encontré excelentes precios en micrófonos 🎤",
      likes: 8,
      comentarios: 2,
    },
  ]);

  const [nuevoPost, setNuevoPost] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nuevoPost.trim() === "") return;

    const nuevo = {
      id: posts.length + 1,
      autor: "Usuario Anónimo",
      contenido: nuevoPost,
      likes: 0,
      comentarios: 0,
    };

    setPosts([nuevo, ...posts]);
    setNuevoPost("");
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white font-sans flex flex-col items-center py-10">
      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-[#FBBF24] mb-8">
        Comunidad de Músicos 🎶
      </h1>
      <p className="text-gray-400 mb-10 text-center max-w-2xl">
        Comparte tus experiencias, recomendaciones y dudas sobre instrumentos, tiendas o grabación.  
        ¡Conecta con otros músicos de la comunidad MusicPriceHub!
      </p>

      {/* Formulario de nueva publicación */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#1E293B] p-6 rounded-2xl shadow-md border border-[#FBBF24]/30 mb-10"
      >
        <div className="flex items-start gap-3">
          <User className="text-[#FBBF24] mt-2" />
          <textarea
            value={nuevoPost}
            onChange={(e) => setNuevoPost(e.target.value)}
            placeholder="Escribe algo para compartir con la comunidad..."
            className="flex-1 bg-[#0f172a] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-[#FBBF24] resize-none"
            rows="3"
          ></textarea>
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#FBBF24] text-black font-semibold px-4 py-2 rounded-md hover:bg-[#F59E0B] transition"
          >
            <Send size={16} />
            Publicar
          </button>
        </div>
      </form>

      {/* Lista de publicaciones */}
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[#1E293B] p-6 rounded-xl border border-[#FBBF24]/20 shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center mb-3">
              <User className="text-[#FBBF24] mr-2" />
              <h2 className="font-semibold text-white">{post.autor}</h2>
            </div>
            <p className="text-gray-300 mb-4">{post.contenido}</p>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <button className="flex items-center gap-1 hover:text-[#FBBF24] transition">
                <Heart size={16} />
                {post.likes}
              </button>
              <button className="flex items-center gap-1 hover:text-[#FBBF24] transition">
                <MessageCircle size={16} />
                {post.comentarios} comentarios
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comunidad;
