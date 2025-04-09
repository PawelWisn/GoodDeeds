import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import axiosClient from "../utils/axiosInstance";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";

const ProtectedRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    axiosClient
      .get("/users/verify_auth/")
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === true) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            className: "",
            style: {
              padding: "0",
              margin: "0",
            },
          }}
        />
        <Navbar />
        <Outlet />
      </>
    );
  } else {
    return <Navigate to="/login" replace />;
  }
};
export default ProtectedRoute;
