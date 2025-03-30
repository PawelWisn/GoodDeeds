import React, { useState, useEffect, useRef } from "react";
import "./Chat.scss";
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
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [myUUID, setMyUUID] = useState(sessionStorage.getItem("user_id")!);

  const socketRef = useRef<WebSocket | null>(null);
  const myPublicKeyRef = useRef<CryptoKey | null>(null);
  const myPublicKeyBase64Ref = useRef<string | null>(null);
  const myPrivateKeyRef = useRef<CryptoKey | null>(null);
  const recipientPublicKeyRef = useRef<CryptoKey | null>(null);

  async function setupKeys(ws: WebSocket) {
    const { publicKey, privateKey, publicKeyBase64 } = await generateKeys();

    myPublicKeyRef.current = publicKey;
    myPublicKeyBase64Ref.current = publicKeyBase64;
    myPrivateKeyRef.current = privateKey;

    ws.send(
      JSON.stringify({
        type: "public_key",
        key: publicKeyBase64,
        ownerUUID: myUUID,
      }),
    );
    console.log("setupKeys - My Public Key Base64 sent:", publicKeyBase64);
  }

  async function handleSendMessage() {
    if (!message || !socketRef.current) return;
    if (!recipientPublicKeyRef.current) {
      console.log(
        "handleSendMessage - no recipient public key, demand public key",
      );
      socketRef.current.send(
        JSON.stringify({ type: "public_key_demand", ownerUUID: myUUID }),
      );
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
    socketRef.current.send(
      JSON.stringify({
        type: "message",
        message: encryptedBase64,
        ownerUUID: myUUID,
      }),
    );
    console.log("handleSendMessage - send:", message);

    setChatLog((prevLog) => [
      ...prevLog,
      { text: message, isOwnMessage: true },
    ]);
    setMessage("");
  }

  async function handlePublicKeyDemand() {
    console.log(
      "handleReceiveMessage - public_key_request:",
      myPublicKeyRef.current,
    );
    if (!socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({
        type: "public_key",
        key: myPublicKeyBase64Ref.current,
        ownerUUID: myUUID,
      }),
    );
    console.log(
      "handleSendMessage - My Public Key Base64 sent:",
      myPublicKeyBase64Ref.current,
    );
  }

  async function handlePublicKey(data: any) {
    const publicKey = await importPublicKey(data.key);
    recipientPublicKeyRef.current = publicKey;
    console.log("Recipient Public Key:", publicKey);
  }
  async function handleMessage(data: any) {
    console.log(
      "handleReceiveMessage - myPrivateKeyRef:",
      myPrivateKeyRef.current,
    );
    if (!myPrivateKeyRef.current) return;
    const decrypted = await decryptMessage(
      data.message,
      myPrivateKeyRef.current,
    );
    console.log("handleReceiveMessage - Decrypted Message:", decrypted);
    setChatLog((prevLog) => [
      ...prevLog,
      { text: decrypted, isOwnMessage: false },
    ]);
  }

  async function handleReceiveMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    if (data.ownerUUID === myUUID) return;
    console.log("handleReceiveMessage - data:", data);
    if (data.type === "message") await handleMessage(data);
    if (data.type === "public_key") await handlePublicKey(data);
    if (data.type === "public_key_demand") await handlePublicKeyDemand();
  }

  useEffect(() => {
    const ws = new WebSocket("ws://0.0.0.0:8000/ws/chat/");
    ws.onopen = () => {
      console.log("WebSocket connected");
      setupKeys(ws);
      socketRef.current = ws;
    };
    ws.onclose = () => console.log("WebSocket closed");
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
