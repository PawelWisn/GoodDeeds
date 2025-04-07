import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";
import "./UserList.scss";

interface User {
  id: number;
  name: string;
  avatar: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/users/logged_in/").then((response) => {
      setUsers(response.data);
    });
  }, []);

  const handleUserClick = async (userId: number) => {
    try {
      const response = await axiosClient.post(`/chats/qwe/`, {
        user_id: userId,
      });
      const { room_id } = response.data;

      navigate(`/chats/${room_id}`);
    } catch (error) {
      console.error("Failed to create chat room:", error);
    }
  };

  return (
    <div className="user-list">
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => handleUserClick(user.id)}>
            <span className="user-name">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
