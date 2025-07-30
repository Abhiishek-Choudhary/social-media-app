// lib/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";
import User from "@/models/User";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & { io?: SocketIOServer };
  };
};

export default function initSocket(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    // In your socket.ts server setup
    io.on("connection", (socket) => {
      socket.on(
        "send_message",
        async ({ senderEmail, receiverEmail, message }) => {
          const sender = await User.findOne({ email: senderEmail });
          const receiver = await User.findOne({ email: receiverEmail });

          if (!sender || !receiver) return;

          const isFollowing = sender.following.includes(receiver._id);
          if (!isFollowing) {
            socket.emit("error", "You can only message people you follow");
            return;
          }

          // Emit message to receiver room
          const room = [senderEmail, receiverEmail].sort().join("-");
          io.to(room).emit("receive_message", {
            senderEmail,
            message,
          });
        }
      );
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
}
