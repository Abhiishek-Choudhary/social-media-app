// context/SocketContext.tsx
"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children, email }: { children: React.ReactNode; email: string }) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("/", { path: "/api/socket" });
    socket.emit("join", { email });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [email]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
