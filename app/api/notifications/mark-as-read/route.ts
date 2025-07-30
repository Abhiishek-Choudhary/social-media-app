import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function POST() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await Notification.updateMany(
    { recipientEmail: session.user.email, read: false },
    { $set: { read: true } }
  );

  return NextResponse.json({ success: true });
}
