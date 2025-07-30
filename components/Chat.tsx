// components/Chat.tsx
"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

export default function Chat({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) {
      socket = io({
        path: "/api/socket",
      });

      socket.on("connect", () => {
        socket?.emit("join", roomId);
      });

      socket.on("message", (msg: string) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("message", { room: roomId, message });
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Chat Room: {roomId}</h2>
      <div>
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
