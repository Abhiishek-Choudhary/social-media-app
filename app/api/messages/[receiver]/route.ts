import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";

export async function GET(
  req: NextRequest,
  { params }: { params: { receiver: string } }
) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  const receiverEmail = decodeURIComponent(params.receiver || "");
  if (!receiverEmail) {
    return NextResponse.json([], { status: 400 });
  }

  const email = session.user.email;

  const messages = await Message.find({
    $or: [
      { sender: email, receiver: receiverEmail },
      { sender: receiverEmail, receiver: email },
    ],
  }).sort({ createdAt: 1 });

  return NextResponse.json({ messages });
}
