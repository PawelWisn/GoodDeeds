import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import "../styles/ChatWindow.scss";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";
import toast from "react-hot-toast";
import WebSocketManager from "../utils/websocketManager";

interface ChatMessage {
	text: string;
	isOwnMessage: boolean;
	timestamp: string;
}

function Chat() {
	const location = useLocation();
	const navigate = useNavigate();
	const roomName = location.state?.roomName || "Chat Room";
	const { id: roomId } = useParams<{ id: string }>();

	const [message, setMessage] = useState("");
	const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
	const [myUUID] = useState(sessionStorage.getItem("user_id")!);
	const [recipientName, setRecipientName] = useState("");
	const [recipientAvatar, setRecipientAvatar] = useState("");
	const [waitingForRecipient, setWaitingForRecipient] = useState(true);

	const socketRef = useRef<WebSocket | null>(null);

	const saveChatData = (updatedChatLog: ChatMessage[] = chatLog) => {
		const chatData = { chatLog: updatedChatLog };
		sessionStorage.setItem(`chat_${roomId}`, JSON.stringify(chatData));
	};

	const restoreChatData = async () => {
		const chatData = sessionStorage.getItem(`chat_${roomId}`);
		if (chatData) {
			const parsed = JSON.parse(chatData);
			setChatLog(parsed.chatLog || []);
		}
	};

	async function sendUserData() {
		const payload = JSON.stringify({
			type: "share_data",
			ownerUUID: myUUID,
			ownerName: sessionStorage.getItem("user_name"),
			ownerAvatar: sessionStorage.getItem("user_avatar"),
		});
		if (socketRef.current) {
			socketRef.current.send(payload);
		}
	}

	async function demandRecipientData() {
		if (!socketRef.current) return;
		setWaitingForRecipient(true);
		const payload = JSON.stringify({
			type: "share_data_demand",
			ownerUUID: myUUID,
		});
		socketRef.current.send(payload);
		await new Promise<void>((resolve) => {
			const interval = setInterval(() => {
				if (recipientName) {
					clearInterval(interval);
					setWaitingForRecipient(false);
					resolve();
				}
			}, 500);
		});
	}

	async function handleSendMessage() {
		if (!message || !socketRef.current) return;
		if (!recipientName) {
			await demandRecipientData();
		} else {
			const timestamp = format(new Date(), "dd.MM.yyyy HH:mm:ss");
			const payload = JSON.stringify({
				type: "message",
				message: message,
				ownerUUID: myUUID,
				timestamp: timestamp,
			});
			socketRef.current.send(payload);

			const newMessage = { text: message, timestamp, isOwnMessage: true };
			setChatLog((prevChatLog: ChatMessage[]) => {
				const updatedChatLog = [...prevChatLog, newMessage];
				saveChatData(updatedChatLog);
				return updatedChatLog;
			});
			setMessage("");
		}
	}

	async function handeUserDataDemand() {
		if (!socketRef.current) return;
		const payload = JSON.stringify({
			type: "share_data",
			ownerUUID: myUUID,
			ownerName: sessionStorage.getItem("user_name"),
			ownerAvatar: sessionStorage.getItem("user_avatar"),
		});
		socketRef.current.send(payload);
	}

	async function handeIncomingUserData(data: any) {
		setWaitingForRecipient(false);
		setRecipientName(data.ownerName);

		const cachedAvatar = sessionStorage.getItem(`avatar_${data.ownerUUID}`);
		if (cachedAvatar) {
			setRecipientAvatar(cachedAvatar);
		} else if (data.ownerAvatar) {
			try {
				const response = await fetch(data.ownerAvatar);
				const blob = await response.blob();
				const reader = new FileReader();
				reader.onloadend = () => {
					const base64data = reader.result as string;
					sessionStorage.setItem(`avatar_${data.ownerUUID}`, base64data);
					setRecipientAvatar(base64data);
				};
				reader.readAsDataURL(blob);
			} catch (error) {
				console.error("Failed to fetch avatar:", error);
			}
		}
		setWaitingForRecipient(data.ownerName ? false : true);
	}

	async function handleIncomingMessage(data: any) {
		const newMessage = {
			text: data.message,
			timestamp: data.timestamp,
			isOwnMessage: false,
		};
		setChatLog((prevChatLog: ChatMessage[]) => {
			const updatedChatLog = [...prevChatLog, newMessage];
			saveChatData(updatedChatLog);
			return updatedChatLog;
		});
	}

	async function sendNotificationRoomJoined() {
		try {
			await axiosClient.post("/users/notifications/", { room_id: roomId });
		} catch (error: any) {
			const error_msg = error.response?.data?.error;
			if (error_msg) {
				toast.error(error_msg);
				navigate("/dashboard");
			}
		}
	}

	async function handleReceiveMessage(event: MessageEvent) {
		const data = JSON.parse(event.data);
		if (data.ownerUUID === myUUID) return;
		if (data.type === "message") await handleIncomingMessage(data);
		if (data.type === "share_data") await handeIncomingUserData(data);
		if (data.type === "share_data_demand") await handeUserDataDemand();
	}

	useEffect(() => {
		restoreChatData();
		const ws = new WebSocket(`ws://0.0.0.0:8000/ws/chat/${roomId}/`);
		WebSocketManager.addConnection(ws);
		ws.onopen = () => {
			console.log("Chat WebSocket connected");
			socketRef.current = ws;
			sendUserData();
			demandRecipientData();
			sendNotificationRoomJoined();
		};
		ws.onmessage = handleReceiveMessage;
		ws.onerror = (error) => console.error("Chat WebSocket error:", error);
		ws.onclose = () => {
			socketRef.current = null;
			WebSocketManager.removeConnection(ws);
		};

		return () => {
			ws.close();
			WebSocketManager.removeConnection(ws);
		};
	}, []);

	return (
		<div className="chat-container">
			<div id="room-bar">
				<div className="recipient-info">
					{recipientAvatar && <img className="recipient-avatar" src={recipientAvatar} alt="Recipient Avatar" />}
					<p className="recipient-name">{recipientName}</p>
				</div>
				<div className="chat-name-header">{roomName}</div>
			</div>
			<div id="chat-log">
				{chatLog.map((msg, index) => (
					<div
						key={index}
						title={msg.timestamp}
						className={`chat-message ${msg.isOwnMessage ? "own-message" : "incoming-message"}`}
					>
						{msg.text}
					</div>
				))}
			</div>
			{waitingForRecipient && <div className="waiting-label">Waiting for recipient to connect...</div>}
			<input
				type="text"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				placeholder="Enter message"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleSendMessage();
					}
				}}
				autoFocus
			/>
			<button onClick={handleSendMessage}>Send</button>
		</div>
	);
}

export default Chat;
