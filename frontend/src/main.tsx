import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./views/Login.tsx";
import Dashboard from "./views/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import App from "./views/Chat.tsx";
import "./index.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="/chat" element={<App />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
