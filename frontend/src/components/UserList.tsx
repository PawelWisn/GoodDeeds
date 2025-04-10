import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";
import "./UserList.scss";

interface User {
  id: number;
  name: string;
  avatar: string;
}
interface ListUsersProps {
  users: User[];
}

const UserList: React.FC<ListUsersProps> = ({ users }) => {
  const navigate = useNavigate();

  const handleUserClick = async (
    recipient_id: number,
    recipient_name: string,
  ) => {
    const roomName = "Private room with " + recipient_name;

    try {
      const response = await axiosClient.get(
        `/chats/private_room/${recipient_id}/`,
      );
      const existingRoom = response.data;

      if (existingRoom) {
        navigate(`/chats/${existingRoom.room_id}`, {
          state: { roomName: roomName },
        });
        return;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 404) {
        console.log("Not found private room, creating new...", error);
      } else {
        console.error("Error fetching existign private room:", error);
      }
    }

    try {
      const newRoomResponse = await axiosClient.post("/chats/", {
        name: roomName,
        private_room: true,
        recipient_id: recipient_id,
      });
      const newRoomId = newRoomResponse.data.id;
      navigate(`/chats/${newRoomId}`, { state: { roomName } });
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        console.error(error.response?.data.message);
        return;
      }
    }
  };

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Users</h3>
        <div className="silver-bar"></div>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => handleUserClick(user.id, user.name)}>
            <span className="user-name">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
