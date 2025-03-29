import React from "react";
import "./ChatRoomCard.scss";

interface ChatRoomCardProps {
  id: number;
  name: string;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ id, name }) => {
  return (
    <div className="chat-room-card card">
      <h3>{name}</h3>
    </div>
  );
};

export default ChatRoomCard;
