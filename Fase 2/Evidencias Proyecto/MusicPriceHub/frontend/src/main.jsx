import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Comunidad from "./pages/Comunidad";
import TemaDetalle from "./pages/TemaDetalle";
import Perfil from "./pages/Perfil";
import PerfilInfo from "./pages/PerfilInfo";
import PrivateRoute from "./components/PrivateRoute";
import "./index.css";
import Marketplace from "./pages/Marketplace";
import CrearPublicacion from "./pages/CrearPublicacion";
import PublicacionDetalle from "./pages/PublicacionDetalle";   // ⬅ IMPORTANTE

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  { path: "/comunidad", element: <Comunidad /> },
  { path: "/comunidad/temas/:id", element: <TemaDetalle /> },

  {
    path: "/perfil",
    element: (
      <PrivateRoute>
        <PerfilInfo />
      </PrivateRoute>
    ),
  },

  {
    path: "/perfil/editar",
    element: (
      <PrivateRoute>
        <Perfil />
      </PrivateRoute>
    ),
  },

  { path: "/marketplace", element: <Marketplace /> },

  {
    path: "/marketplace/publicar",
    element: (
      <PrivateRoute>
        <CrearPublicacion />
      </PrivateRoute>
    ),
  },

  // ⭐ NUEVA RUTA PARA EL DETALLE DE LA PUBLICACIÓN
  {
    path: "/marketplace/publicacion/:id",
    element: <PublicacionDetalle />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
