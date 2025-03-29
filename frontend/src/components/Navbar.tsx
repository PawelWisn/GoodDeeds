import "./Navbar.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";

const Navbar: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("user_name");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      axiosClient.get("/users/about_me/").then((response) => {
        setUserName(response.data.user_name);
        sessionStorage.setItem("user_name", response.data.user_name);
        sessionStorage.setItem("user_id", response.data.user_id);
      });
    }
  }, []);

  const handleLogout = () => {
    axiosClient.post("/users/logout/").then(() => {
      sessionStorage.clear();
      navigate("/login");
    });
  };
  const redirectToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <nav>
      <div id={"nav-app-name"} onClick={redirectToDashboard}>
        GoodDeeds
      </div>
      <div id={"nav-user-name"}>{userName || ""}</div>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
