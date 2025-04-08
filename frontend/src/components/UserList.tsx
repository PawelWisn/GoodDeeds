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

  const handleUserClick = async () => {
    const user_name = sessionStorage.getItem("user_name");
    const room_name = user_name ? `${user_name}'s room` : "Private room";
    await axiosClient
      .post("/chats/", { name: room_name, private_room: true })
      .then((response) => {
        const new_chat_id = response.data.id;
        axiosClient
          .post(`/chats/${new_chat_id}/join/`)
          .then(() => {
            navigate(`/chats/${new_chat_id}`, {
              state: { roomName: room_name },
            });
          })
          .catch(() => {
            navigate("/login");
          });
      });
  };

  return (
    <div className="user-list">
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => handleUserClick()}>
            <span className="user-name">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
