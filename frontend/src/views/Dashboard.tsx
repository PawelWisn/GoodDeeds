import "./Dashboard.scss";
import "../index.scss";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import axiosClient from "../utils/axiosInstance";
import ListChatRooms from "../components/ListChatRooms";
import NewChatRoom from "../components/NewChatRoom";
import UserList from "../components/UserList";

interface ChatRoom {
  id: number;
  name: string;
  can_delete: boolean;
}

function Dashboard() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const location = useLocation();

  const initial = () => {
    fetchChatRooms();
  };

  const fetchChatRooms = () => {
    axiosClient.get("/chats/").then((response) => {
      setChatRooms(response.data);
    });
  };

  const handleDeleteChatRoom = (id: number) => {
    axiosClient.delete(`/chats/${id}/`).then(() => {
      setChatRooms((prevRooms) =>
        prevRooms.filter((room: ChatRoom) => room.id !== id),
      );
    });
  };

  useEffect(initial, []);

  useEffect(() => {
    if (location.state?.refresh) {
      initial();
    }
  }, [location.state]);

  return (
    <div className="dashboard">
      <div className="main-content">
        <NewChatRoom onChatRoomCreated={fetchChatRooms} />
        <ListChatRooms chatRooms={chatRooms} onDelete={handleDeleteChatRoom} />
      </div>
      <UserList />
    </div>
  );
}

export default Dashboard;
