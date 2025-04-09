import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";
import "./Navbar.scss";
import toast from "react-hot-toast";

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

    const fetchNotification = async () => {
      const response = await axiosClient.get("/users/notifications/");
      if (response.data.notification) {
        const msg = response.data.notification;
        const private_room = response.data.private_room;
        const roomName = private_room
          ? "Private room with " + response.data.inviter
          : response.data.room_name;
        const roomId = response.data.room_id;
        const roomUrl = `/chats/${roomId}`;

        if (location.pathname === roomUrl) {
          console.log("Already in the chat room, no toast shown");
          return;
        }

        toast(
          (t) => (
            <div
              style={{
                position: "relative",
                padding: "0",
                margin: "0",
                backgroundColor: "#333",
                color: "#fff",
                borderRadius: "5px",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "#333",
                  color: "red",
                  border: "none",
                  padding: "0",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  lineHeight: "1",
                }}
                onClick={() => {
                  toast.dismiss(t.id);
                  console.log("Notification dismissed");
                }}
              >
                x
              </button>
              <div style={{ marginRight: "2px" }}>{msg}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "1rem",
                }}
              >
                <button
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate("/dashboard", { state: { refresh: true } });
                    setTimeout(() => {
                      navigate(roomUrl, { state: { roomName } });
                    }, 1);
                    toast.remove(t.id);
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          ),
          {
            duration: 10000,
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "5px",
              padding: "10px",
            },
          },
        );
      }
    };
    fetchNotification();
    const interval = setInterval(fetchNotification, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    axiosClient.post("/users/logout/").then(() => {
      navigate("/login");
    });
  };

  const redirectToDashboard = () => {
    navigate("/dashboard", { state: { refresh: true } });
  };

  return (
    <nav className="navbar">
      <div className="nav-app-name" onClick={redirectToDashboard}>
        GoodDeeds
      </div>
      <div className="navbar-right">
        <div className="nav-user-name">{userName || ""}</div>
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
