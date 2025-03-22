import React, { useState, useEffect, useRef } from "react";

import {
  generateKeys,
  importPublicKey,
  encryptMessage,
  decryptMessage,
} from "../utils/crypto";

function Chat() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<string>("");

  const publicKeyRef = useRef<CryptoKey | null>(null);
  const privateKeyRef = useRef<CryptoKey | null>(null);

  async function setupKeys() {
    const { publicKey, privateKey, publicKeyBase64 } = await generateKeys();
    publicKeyRef.current = publicKey;
    privateKeyRef.current = privateKey;
  }

  async function handleSendMessage() {
    if (!publicKeyRef.current) return;
    const encryptedBase64 = await encryptMessage(message, publicKeyRef.current);
    socket?.send(
      JSON.stringify({
        type: "message",
        message: encryptedBase64,
        publicKey: publicKeyRef.current,
      }),
    );
  }

  async function handleReceiveMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);
    if (data.type === "message") {
      if (!privateKeyRef.current) return;
      const decrypted = await decryptMessage(
        data.message,
        privateKeyRef.current,
      );
      console.log("Decrypted Message:", decrypted);
      setChatLog((prevLog) => prevLog + decrypted + "\n");
    }
  }

  useEffect(() => {
    setupKeys();

    const ws = new WebSocket("ws://0.0.0.0:8000/ws/chat/");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket closed");
    ws.onmessage = handleReceiveMessage;
    ws.onerror = (error) => console.error("WebSocket error:", error);
    setSocket(ws);

    return () => ws.close();
  }, []);

  return (
    <div>
      <textarea
        id="chat-log"
        cols={100}
        rows={20}
        value={chatLog}
        readOnly
      ></textarea>
      <br />
      <input
        size={100}
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
