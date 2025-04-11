import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import "../styles/ChatWindow.scss";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router";
import axiosClient from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { generateKeys, importPublicKey, encryptMessage, decryptMessage } from "../utils/crypto";
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
	const [demandingPublicKey, setDemandingPublicKey] = useState(false);

	const socketRef = useRef<WebSocket | null>(null);
	const myPublicKeyRef = useRef<CryptoKey | null>(null);
	const myPublicKeyBase64Ref = useRef<string | null>(null);
	const myPrivateKeyRef = useRef<CryptoKey | null>(null);
	const recipientPublicKeyRef = useRef<CryptoKey | null>(null);

	const saveChatData = (updatedChatLog: ChatMessage[] = chatLog) => {
		const chatData = {
			chatL: updatedChatLog,
			myPublicKeyBase64: myPublicKeyBase64Ref.current,
		};
		sessionStorage.setItem(`chat_${roomId}`, JSON.stringify(chatData));
	};

	const restoreChatData = async () => {
		const chatData = sessionStorage.getItem(`chat_${roomId}`);
		if (chatData) {
			const { chatL, myPublicKeyBase64 } = JSON.parse(chatData);
			setChatLog(chatL || []);
			myPublicKeyBase64Ref.current = myPublicKeyBase64;
		}
	};

	async function setupKeys() {
		const { publicKey, privateKey, publicKeyBase64 } = await generateKeys();

		myPublicKeyRef.current = publicKey;
		myPublicKeyBase64Ref.current = publicKeyBase64;
		myPrivateKeyRef.current = privateKey;

		const payload = JSON.stringify({
			type: "public_key",
			key: publicKeyBase64,
			ownerUUID: myUUID,
			ownerName: sessionStorage.getItem("user_name"),
			ownerAvatar: sessionStorage.getItem("user_avatar"),
		});
		if (socketRef.current) {
			socketRef.current.send(payload);
		}
	}

	async function demandPublicKey() {
		if (demandingPublicKey || !socketRef.current) return;
		setDemandingPublicKey(true);
		setWaitingForRecipient(true);
		const payload = JSON.stringify({
			type: "public_key_demand",
			ownerUUID: myUUID,
		});
		socketRef.current.send(payload);
		await new Promise<void>((resolve) => {
			const interval = setInterval(() => {
				if (recipientPublicKeyRef.current) {
					clearInterval(interval);
					setWaitingForRecipient(false);
					setDemandingPublicKey(false);
					resolve();
				}
			}, 500);
		});
	}

	async function handleSendMessage() {
		if (!message || !socketRef.current) return;
		if (!recipientPublicKeyRef.current) {
			await demandPublicKey();
		} else {
			const encryptedBase64 = await encryptMessage(message, recipientPublicKeyRef.current!);
			const timestamp = format(new Date(), "dd.MM.yyyy HH:mm:ss");
			const payload = JSON.stringify({
				type: "message",
				message: encryptedBase64,
				ownerUUID: myUUID,
				timestamp: timestamp,
			});
			socketRef.current.send(payload);

			const newMessage = { text: message, timestamp, isOwnMessage: true };
			setChatLog((prevChatLog) => {
				const updatedChatLog = [...prevChatLog, newMessage];
				saveChatData(updatedChatLog);
				return updatedChatLog;
			});
			setMessage("");
		}
	}

	async function handlePublicKeyDemand() {
		if (!socketRef.current) return;
		const payload = JSON.stringify({
			type: "public_key",
			key: myPublicKeyBase64Ref.current,
			ownerUUID: myUUID,
			ownerName: sessionStorage.getItem("user_name"),
			ownerAvatar: sessionStorage.getItem("user_avatar"),
		});
		socketRef.current.send(payload);
	}

	async function handlePublicKey(data: any) {
		let publicKey: CryptoKey | null = null;
		if (data.key) {
			publicKey = await importPublicKey(data.key);
		}
		recipientPublicKeyRef.current = publicKey;
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

		setWaitingForRecipient(recipientPublicKeyRef.current === null);
	}

	async function handleIncomingMessage(data: any) {
		if (!myPrivateKeyRef.current) return;
		const decrypted = await decryptMessage(data.message, myPrivateKeyRef.current);
		const newMessage = {
			text: decrypted,
			timestamp: data.timestamp,
			isOwnMessage: false,
		};
		setChatLog((prevChatLog) => {
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
		if (data.type === "public_key") await handlePublicKey(data);
		if (data.type === "public_key_demand") await handlePublicKeyDemand();
	}

	useEffect(() => {
		restoreChatData();
		const ws = new WebSocket(`ws://0.0.0.0:8000/ws/chat/${roomId}/`);
		WebSocketManager.addConnection(ws);
		ws.onopen = () => {
			console.log("Chat WebSocket connected");
			socketRef.current = ws;
			setupKeys();
			demandPublicKey();
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
			<button onClick={handleSendMessage}>Encrypt & Send</button>
		</div>
	);
}

export default Chat;
