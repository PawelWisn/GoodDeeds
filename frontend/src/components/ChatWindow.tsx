import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import "./ChatWindow.scss";
import {
  generateKeys,
  importPublicKey,
  encryptMessage,
  decryptMessage,
} from "../utils/crypto";

interface ChatMessage {
  text: string;
  isOwnMessage: boolean;
}

function Chat() {
  const { id: roomId } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [myUUID] = useState(sessionStorage.getItem("user_id")!);

  const socketRef = useRef<WebSocket | null>(null);
  const myPublicKeyRef = useRef<CryptoKey | null>(null);
  const myPublicKeyBase64Ref = useRef<string | null>(null);
  const myPrivateKeyRef = useRef<CryptoKey | null>(null);
  const recipientPublicKeyRef = useRef<CryptoKey | null>(null);

  async function setupKeys() {
    const { publicKey, privateKey, publicKeyBase64 } = await generateKeys();

    myPublicKeyRef.current = publicKey;
    myPublicKeyBase64Ref.current = publicKeyBase64;
    myPrivateKeyRef.current = privateKey;

    const payload = JSON.stringify({
      type: "public_key",
      key: publicKeyBase64,
      ownerUUID: myUUID,
    });
    socketRef.current!.send(payload);
  }

  async function handleSendMessage() {
    if (!message || !socketRef.current) return;
    if (!recipientPublicKeyRef.current) {
      const payload = JSON.stringify({
        type: "public_key_demand",
        ownerUUID: myUUID,
      });
      socketRef.current.send(payload);
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (recipientPublicKeyRef.current) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

    const encryptedBase64 = await encryptMessage(
      message,
      recipientPublicKeyRef.current!,
    );
    const payload = JSON.stringify({
      type: "message",
      message: encryptedBase64,
      ownerUUID: myUUID,
    });
    socketRef.current.send(payload);

    setChatLog((prevLog) => [
      ...prevLog,
      { text: message, isOwnMessage: true },
    ]);
    setMessage("");
  }

  async function handlePublicKeyDemand() {
    if (!socketRef.current) return;
    const payload = JSON.stringify({
      type: "public_key",
      key: myPublicKeyBase64Ref.current,
      ownerUUID: myUUID,
    });
    socketRef.current.send(payload);
  }

  async function handlePublicKey(data: any) {
    const publicKey = await importPublicKey(data.key);
    recipientPublicKeyRef.current = publicKey;
  }

  async function handleMessage(data: any) {
    if (!myPrivateKeyRef.current) return;
    const decrypted = await decryptMessage(
      data.message,
      myPrivateKeyRef.current,
    );
    setChatLog((prevLog) => [
      ...prevLog,
      { text: decrypted, isOwnMessage: false },
    ]);
  }

  async function handleReceiveMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    if (data.ownerUUID === myUUID) return;
    if (data.type === "message") await handleMessage(data);
    if (data.type === "public_key") await handlePublicKey(data);
    if (data.type === "public_key_demand") await handlePublicKeyDemand();
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://0.0.0.0:8000/ws/chat/${roomId}/`);
    ws.onopen = () => {
      socketRef.current = ws;
      setupKeys();
    };
    ws.onmessage = handleReceiveMessage;
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => ws.close();
  }, []);

  return (
    <div className="chat-container">
      <div id="chat-log">
        {chatLog.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.isOwnMessage ? "own-message" : "incoming-message"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleSendMessage}>Encrypt & Send</button>
    </div>
  );
}

export default Chat;
