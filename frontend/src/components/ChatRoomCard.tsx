import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";
import "../styles/ChatRoomCard.scss";
import toast from "react-hot-toast";

interface ChatRoomCardProps {
  id: number;
  name: string;
  canDelete: boolean;
  onDelete: (id: number) => void;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ id, name, canDelete, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = async () => {
    try {
      const response = await axiosClient.post(`/chats/${id}/join/`);
      if (response.status === 200) {
        navigate(`/chats/${id}`, { state: { roomName: name } });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast("Session expired, please log in again", { icon: "⚠️" });
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "An unexpected error occurred");
        navigate("/dashboard", { state: { refresh: true } });
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="chat-room-card card" onClick={handleCardClick}>
      <h3>{name}</h3>
      {canDelete && (
        <button className="delete-button" onClick={handleDeleteClick}>
          ✕
        </button>
      )}
    </div>
  );
};

export default ChatRoomCard;
