import React from "react";
import "./ListChatRooms.scss";

interface ChatRoom {
  id: number;
  name: string;
  description: string;
}

interface ListChatRoomsProps {
  chatRooms: ChatRoom[];
}

const ListChatRooms: React.FC<ListChatRoomsProps> = ({ chatRooms }) => {
  return (
    <div className="chat-rooms-container">
      <h2>Chat Rooms</h2>
      <div className="chat-rooms-grid">
        {chatRooms.map((room) => (
          <div key={room.id} className="chat-room-card">
            <h3>{room.name}</h3>
            <p>{room.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListChatRooms;
