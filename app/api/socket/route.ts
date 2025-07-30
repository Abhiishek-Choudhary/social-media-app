import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseWithSocket } from "@/types/NextApiResponseWithSocket";
import Message from "@/models/Message";
import { connectDB } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io...");

    const io = new ServerIO(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("send-message", async ({ sender, receiver, text }) => {
        await connectDB();

        // Save to MongoDB
        const message = await Message.create({ sender, receiver, text });

        const room = [sender, receiver].sort().join("-");
        socket.join(room);
        io.to(room).emit("receive-message", message);
      });
    });
  }

  res.end();
}
