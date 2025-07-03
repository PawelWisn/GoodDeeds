import React from "react";
import "../styles/ListChatRooms.scss";
import ChatRoomCard from "./ChatRoomCard";

interface ChatRoom {
	id: number;
	name: string;
	can_delete: boolean;
}

interface ListChatRoomsProps {
	chatRooms: ChatRoom[];
	onDelete: (id: number) => void;
}

const ListChatRooms: React.FC<ListChatRoomsProps> = ({ chatRooms, onDelete }) => {
	return (
		<div className="chat-rooms-container">
			<h2>Chat Rooms</h2>
			<div className="chat-rooms-grid">
				{chatRooms.map((room) => (
					<ChatRoomCard key={room.id} id={room.id} name={room.name} canDelete={room.can_delete} onDelete={onDelete} />
				))}
			</div>
		</div>
	);
};

export default ListChatRooms;
