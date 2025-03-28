import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./views/Login.tsx";
import Dashboard from "./views/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./views/Chat.tsx";
import "./index.scss";

const VITE_GOOGLE_AUTH_KEY = import.meta.env.VITE_GOOGLE_AUTH_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={VITE_GOOGLE_AUTH_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
