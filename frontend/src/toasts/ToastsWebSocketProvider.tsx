import React, { createContext, useContext, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

interface WebSocketContextType {
  handleStorageChange: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  const connectWebSocket = () => {
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) {
      return;
    }

    const ws = new WebSocket(`ws://0.0.0.0:8000/ws/notifications/${user_id}/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.notification) {
        handleNotification(data);
      }
    };
    ws.onopen = () => {
      console.log("Notification WebSocket connected", user_id);
      socketRef.current = ws;
    };
    ws.onclose = () => console.log("Notification WebSocket disconnected");
    ws.onerror = (error) =>
      console.error("Notification WebSocket error:", error);
  };

  const handleStorageChange = () => {
    const user_id = sessionStorage.getItem("user_id");
    if (user_id) {
      connectWebSocket();
    } else if (socketRef.current) {
      socketRef.current.close();
    }
  };

  useEffect(() => {
    handleStorageChange();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleNotification = (data: any) => {
    const { notification, room_id, room_name } = data;
    const roomUrl = `/chats/${room_id}`;

    if (window.location.pathname === roomUrl) {
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
            }}
          >
            x
          </button>
          <div style={{ marginRight: "2px" }}>{notification}</div>
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
                  navigate(roomUrl, { state: { roomName: room_name } });
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
  };

  return (
    <WebSocketContext.Provider value={{ handleStorageChange }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
