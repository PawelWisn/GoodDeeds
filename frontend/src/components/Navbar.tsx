import "./Navbar.scss";
import React from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    axiosClient.post("/users/logout/").then(() => {
      navigate("/login");
    });
  };
  const redirectToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <nav>
      <div onClick={redirectToDashboard}>GoodDeeds</div>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
