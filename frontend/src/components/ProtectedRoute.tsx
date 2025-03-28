import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import axiosClient from "../utils/axiosInstance";
import Navbar from "./Navbar";

const ProtectedRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    axiosClient
      .get("/users/verify_auth/")
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === true) {
    return (
      <div>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    );
  } else {
    return <Navigate to="/login" replace />;
  }
};
export default ProtectedRoute;
