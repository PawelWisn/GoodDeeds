import "./Navbar.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";

const Navbar: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("user_name");
    const storedUserAvatar = sessionStorage.getItem("user_avatar");
    if (storedUserName && storedUserAvatar) {
      setUserName(storedUserName);
      setUserAvatar(storedUserAvatar);
    } else {
      axiosClient.get("/users/about_me/").then((response) => {
        setUserName(response.data.user_name);
        setUserAvatar(response.data.user_avatar);
        sessionStorage.setItem("user_name", response.data.user_name);
        sessionStorage.setItem("user_id", response.data.user_id);
        sessionStorage.setItem("user_avatar", response.data.user_avatar);
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
    navigate("/dashboard", { state: { refresh: true } });
  };

  return (
    <nav className="navbar">
      <div id="nav-app-name" onClick={redirectToDashboard}>
        GoodDeeds
      </div>
      <div className="navbar-right">
        <div id="nav-user-name">{userName || ""}</div>
        {userAvatar && (
          <img
            className="recipient-avatar"
            src={userAvatar}
            alt="User Avatar"
          />
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
