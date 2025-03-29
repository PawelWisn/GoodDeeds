import React from "react";
import "./ListChatRooms.scss";
import ChatRoomCard from "./ChatRoomCard";

interface ChatRoom {
  id: number;
  name: string;
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
          <ChatRoomCard key={room.id} id={room.id} name={room.name} />
        ))}
      </div>
    </div>
  );
};

export default ListChatRooms;
