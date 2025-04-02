import "../index.scss";
import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axiosInstance";
import ListChatRooms from "../components/ListChatRooms";
import NewChatRoom from "../components/NewChatRoom";

interface ChatRoom {
  id: number;
  name: string;
  can_delete: boolean;
}

function Dashboard() {
  const [chatRooms, setChatRooms] = useState([]);

  const fetchChatRooms = () => {
    axiosClient.get("/chats/").then((response) => {
      setChatRooms(response.data);
    });
  };

  const handleDeleteChatRoom = (id: number) => {
    axiosClient
      .delete(`/chats/${id}/`)
      .then(() => {
        setChatRooms((prevRooms) =>
          prevRooms.filter((room: ChatRoom) => room.id !== id),
        );
      })
      .catch((error) => {
        console.error("Failed to delete chat room:", error);
      });
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  return (
    <div>
      <NewChatRoom onChatRoomCreated={fetchChatRooms} />
      <ListChatRooms chatRooms={chatRooms} onDelete={handleDeleteChatRoom} />
    </div>
  );
}

export default Dashboard;
