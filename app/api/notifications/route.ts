import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email;

  const notifications = await Notification.find({ recipientEmail: userEmail })
    .sort({ createdAt: -1 })
    .lean();

  const unreadCount = await Notification.countDocuments({
    recipientEmail: userEmail,
    read: false,
  });

  return NextResponse.json({ notifications, unreadCount });
}
