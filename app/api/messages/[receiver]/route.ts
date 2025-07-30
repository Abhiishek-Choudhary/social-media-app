import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";

export async function GET(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  // ✅ Extract 'receiver' param from the URL
  const receiver = req.nextUrl.pathname.split("/").pop(); // e.g., "receiver"
  const receiverEmail = decodeURIComponent(receiver || "");
  const email = session.user.email;

  if (!receiverEmail) {
    return NextResponse.json([], { status: 400 });
  }

  const messages = await Message.find({
    $or: [
      { sender: email, receiver: receiverEmail },
      { sender: receiverEmail, receiver: email },
    ],
  }).sort({ createdAt: 1 });

  return NextResponse.json({ messages });
}
