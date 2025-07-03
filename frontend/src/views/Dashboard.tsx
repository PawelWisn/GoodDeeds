import "../styles/Dashboard.scss";
import "../index.scss";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import axiosClient from "../utils/axiosInstance";
import ListChatRooms from "../components/ListChatRooms";
import NewChatRoom from "../components/NewChatRoom";
import UserList from "../components/UserList";

import toast from "react-hot-toast";

interface ChatRoom {
	id: number;
	name: string;
	can_delete: boolean;
}
interface User {
	id: number;
	name: string;
	avatar: string;
}

function Dashboard() {
	const location = useLocation();
	const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
	const [users, setUsers] = useState<User[]>([]);

	const initial = () => {
		fetchChatRooms();
		fetchUsersRooms();
	};

	const fetchChatRooms = () => {
		axiosClient.get("/chats/").then((response) => {
			setChatRooms(response.data);
		});
	};

	const fetchUsersRooms = () => {
		axiosClient.get("/users/logged_in/").then((response) => {
			setUsers(response.data);
		});
	};

	const handleDeleteChatRoom = (id: number) => {
		axiosClient.delete(`/chats/${id}/`).then(() => {
			setChatRooms((prevRooms) => prevRooms.filter((room: ChatRoom) => room.id !== id));
		});
		toast.success("Chat room deleted successfully!");
	};

	useEffect(initial, []);

	useEffect(() => {
		if (location.state?.refresh) {
			initial();
		}
	}, [location.state]);

	return (
		<div className="dashboard">
			<div className="main-content">
				<NewChatRoom onChatRoomCreated={fetchChatRooms} />
				<ListChatRooms chatRooms={chatRooms} onDelete={handleDeleteChatRoom} />
			</div>
			<UserList users={users} />
		</div>
	);
}

export default Dashboard;
