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
  const [waitingForRecipient, setWaitingForRecipient] = useState(true);

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

  async function demandPublicKey() {
    setWaitingForRecipient(true);

    const payload = JSON.stringify({
      type: "public_key_demand",
      ownerUUID: myUUID,
    });
    socketRef.current!.send(payload);
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (recipientPublicKeyRef.current) {
          clearInterval(interval);
          setWaitingForRecipient(false);
          resolve();
        }
      }, 100);
    });
  }

  async function handleSendMessage() {
    if (!message || !socketRef.current) return;

    if (!recipientPublicKeyRef.current) {
      await demandPublicKey();
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
    let publicKey: CryptoKey | null = null;
    if (data.key) {
      publicKey = await importPublicKey(data.key);
    }
    recipientPublicKeyRef.current = publicKey;

    setWaitingForRecipient(recipientPublicKeyRef.current === null);
  }

  async function handleIncomingMessage(data: any) {
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
    if (data.type === "message") await handleIncomingMessage(data);
    if (data.type === "public_key") await handlePublicKey(data);
    if (data.type === "public_key_demand") await handlePublicKeyDemand();
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://0.0.0.0:8000/ws/chat/${roomId}/`);
    ws.onopen = () => {
      socketRef.current = ws;
      setupKeys();
      console.log("WebSocket connection established");
      demandPublicKey();
    };
    ws.onmessage = handleReceiveMessage;
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => {
      socketRef.current = null;
    };

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
      {waitingForRecipient && (
        <div className="waiting-label">Waiting for recipient to connect...</div>
      )}
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
