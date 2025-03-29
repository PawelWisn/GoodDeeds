import "../index.scss";
import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axiosInstance";
import ListChatRooms from "../components/ListChatRooms";
import NewChatRoom from "../components/NewChatRoom";

function Dashboard() {
  const [chatRooms, setChatRooms] = useState([]);

  const fetchChatRooms = () => {
    axiosClient.get("/chats/").then((response) => {
      setChatRooms(response.data);
    });
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  return (
    <div>
      <NewChatRoom onChatRoomCreated={fetchChatRooms} />
      <ListChatRooms chatRooms={chatRooms} />
    </div>
  );
}

export default Dashboard;
