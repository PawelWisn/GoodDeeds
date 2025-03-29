import React from "react";
import { useNavigate } from "react-router";
import "./ChatRoomCard.scss";

interface ChatRoomCardProps {
  id: number;
  name: string;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ id, name }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/chats/${id}`);
  };

  return (
    <div className="chat-room-card card" onClick={handleCardClick}>
      <h3>{name}</h3>
    </div>
  );
};

export default ChatRoomCard;
