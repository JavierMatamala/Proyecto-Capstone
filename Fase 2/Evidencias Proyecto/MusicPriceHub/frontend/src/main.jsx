import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Comunidad from "./pages/Comunidad";

import TemaDetalle from "./pages/TemaDetalle";   // ← ⬅ IMPORTANTE
import Perfil from "./pages/Perfil";
import PerfilInfo from "./pages/PerfilInfo";
import PrivateRoute from "./components/PrivateRoute";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // LISTA DE TEMAS
  { path: "/comunidad", element: <Comunidad /> },

  // DETALLE DE TEMA DEL FORO  ← ⬅ ESTA RUTA SE NECESITABA
  { path: "/comunidad/temas/:id", element: <TemaDetalle /> },

  // PERFIL (vista pública del usuario conectado)
  {
    path: "/perfil",
    element: (
      <PrivateRoute>
        <PerfilInfo />
      </PrivateRoute>
    ),
  },

  // EDITAR PERFIL
  {
    path: "/perfil/editar",
    element: (
      <PrivateRoute>
        <Perfil />
      </PrivateRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
