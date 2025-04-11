import React, { useState } from "react";
import axiosClient from "../utils/axiosInstance";
import { useNavigate } from "react-router";
import "../styles/NewChatRoom.scss";
import toast from "react-hot-toast";

interface NewChatRoomProps {
	onChatRoomCreated: () => void;
}

const NewChatRoom: React.FC<NewChatRoomProps> = ({ onChatRoomCreated }) => {
	const navigate = useNavigate();
	const [chatRoomName, setChatRoomName] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!chatRoomName.trim()) {
			toast.error("Chat room name cannot be empty");
			return;
		}

		axiosClient
			.post("/chats/", { name: chatRoomName })
			.then(() => {
				toast.success("Chat room created successfully!");
				setChatRoomName("");
				onChatRoomCreated();
			})
			.catch((error) => {
				if (error.response?.status === 401) {
					toast("Session expired, please log in again", { icon: "⚠️" });
					navigate("/login");
				} else {
					toast.error(error.response?.data?.error || "Failed to create chat room");
				}
			});
	};

	return (
		<div className="new-chat-room-container">
			<h2>Create new chat room</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Enter chat room name"
					value={chatRoomName}
					onChange={(e) => setChatRoomName(e.target.value)}
				/>
				<button type="submit">Create</button>
			</form>
		</div>
	);
};

export default NewChatRoom;
