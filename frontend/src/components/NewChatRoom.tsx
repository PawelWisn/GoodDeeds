import React, { useState } from "react";
import axiosClient from "../utils/axiosInstance";
import "./NewChatRoom.scss";

interface NewChatRoomProps {
  onChatRoomCreated: () => void;
}

const NewChatRoom: React.FC<NewChatRoomProps> = ({ onChatRoomCreated }) => {
  const [chatRoomName, setChatRoomName] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatRoomName.trim()) {
      setErrorMessage("Chat room name cannot be empty.");
      return;
    }

    axiosClient
      .post("/chats/", { name: chatRoomName })
      .then(() => {
        setSuccessMessage("Chat room created successfully!");
        setErrorMessage(null);
        setChatRoomName("");
        onChatRoomCreated();
      })
      .catch((error) => {
        setErrorMessage(
          error.response?.data?.error || "Failed to create chat room.",
        );
        setSuccessMessage(null);
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
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default NewChatRoom;
