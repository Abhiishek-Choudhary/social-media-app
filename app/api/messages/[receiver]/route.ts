import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";

// ✅ Important for session-based routes
export const dynamic = "force-dynamic";

type Context = {
  params: {
    receiver: string;
  };
};

export async function GET(req: NextRequest, context: Context) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  const receiverEmail = decodeURIComponent(context.params.receiver);
  const email = session.user.email;

  const messages = await Message.find({
    $or: [
      { sender: email, receiver: receiverEmail },
      { sender: receiverEmail, receiver: email },
    ],
  }).sort({ createdAt: 1 });

  return NextResponse.json({ messages });
}
