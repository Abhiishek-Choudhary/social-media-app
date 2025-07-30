import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Message from "@/models/Message";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { receiver: string } }) => {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const receiverEmail = decodeURIComponent(params.receiver);
  const email = session.user.email;

  const messages = await Message.find({
    $or: [
      { sender: email, receiver: receiverEmail },
      { sender: receiverEmail, receiver: email },
    ],
  }).sort({ createdAt: 1 });

  return NextResponse.json({ messages });
};
