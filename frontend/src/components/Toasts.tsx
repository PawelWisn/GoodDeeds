import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";

import React, { useEffect, useState } from "react";

function Toasts() {
  const navigate = useNavigate();

  useEffect(() => {
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
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "",
        style: {
          padding: "4px 10px",
          margin: "0",
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      }}
    />
  );
}

export default Toasts;
