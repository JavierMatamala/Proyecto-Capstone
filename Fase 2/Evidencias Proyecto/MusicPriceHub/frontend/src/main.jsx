import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Comunidad from "./pages/Comunidad";
import Perfil from "./pages/Perfil";          // ← formulario editar perfil
import PerfilInfo from "./pages/PerfilInfo";  // ← vista principal del perfil
import PrivateRoute from "./components/PrivateRoute";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/comunidad", element: <Comunidad /> },

  // 🧩 Perfil (Vista principal)
  {
    path: "/perfil",
    element: (
      <PrivateRoute>
        <PerfilInfo />
      </PrivateRoute>
    ),
  },

  // 🧩 Edición de perfil
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
