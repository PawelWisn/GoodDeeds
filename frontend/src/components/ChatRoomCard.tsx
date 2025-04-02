import React from "react";
import { useNavigate } from "react-router";
import "./ChatRoomCard.scss";

interface ChatRoomCardProps {
  id: number;
  name: string;
  canDelete: boolean;
  onDelete: (id: number) => void;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({
  id,
  name,
  canDelete,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/chats/${id}`);
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
