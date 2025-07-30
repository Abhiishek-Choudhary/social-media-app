"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";
import Image from 'next/image';

type Message = {
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
};

type User = {
  _id: string;
  username: string;
  email: string;
  image?: string;
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const socket = useSocket();
  const [usersIFollow, setUsersIFollow] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const currentEmail = session?.user?.email;

  // ✅ Fetch users I follow
  const fetchFollowingUsers = async () => {
    const res = await fetch("/api/users/following");
    const data = await res.json();

    console.log("Fetched following users:", data); // 👈 Check here

    if (Array.isArray(data)) {
      setUsersIFollow(data);
    } else {
      setUsersIFollow([]);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchFollowingUsers();
    }
  }, [status]);

  // ✅ Fetch previous messages with selected user
  useEffect(() => {
    if (!selectedUser || !currentEmail) return;

    fetch(`/api/messages/${selectedUser.email}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      });
  }, [selectedUser, currentEmail]);

  // ✅ Handle real-time receiving messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      if (
        msg.sender === selectedUser?.email ||
        msg.receiver === selectedUser?.email
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive-message", handleReceive);
    return () => {
      socket.off("receive-message", handleReceive);
    };
  }, [socket, selectedUser]);

  const handleSend = () => {
    if (!text.trim() || !selectedUser || !currentEmail) return;

    const msg: Message = {
      sender: currentEmail,
      receiver: selectedUser.email,
      text,
      createdAt: new Date().toISOString(),
    };

    socket?.emit("send-message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div className="flex h-[80vh] border rounded overflow-hidden">
      {/* Left Panel: Users I follow */}
      <div className="w-1/3 border-r overflow-y-auto">
        {usersIFollow.map((user) => (
          <div
            key={user._id}
            className={`p-3 flex items-center cursor-pointer hover:bg-gray-100 ${
              selectedUser?._id === user._id ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <Image
              src={user.image || "/default-avatar.png"}
              alt={user.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="font-medium">{user.username}</span>
          </div>
        ))}
      </div>

      {/* Right Panel: Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-3 border-b font-semibold">
              Chat with {selectedUser.username}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-xs p-2 rounded-lg ${
                    msg.sender === currentEmail
                      ? "bg-blue-500 text-white self-end ml-auto"
                      : "bg-gray-200 text-black self-start mr-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 border rounded px-3 py-1 mr-2"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
