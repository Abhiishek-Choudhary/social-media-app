// app/api/users/[email]/follow/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserEmail = session.user.email;

  // ✅ Extract email from URL safely
  const pathParts = req.nextUrl.pathname.split("/");
  const targetEmail = decodeURIComponent(pathParts[pathParts.length - 2]); // "follow" is last, so email is second last

  await connectDB();

  const user = await User.findOne({ email: targetEmail });
  const currentUser = await User.findOne({ email: currentUserEmail });

  if (!user || !currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.followers.includes(currentUserEmail)) {
    user.followers.push(currentUserEmail);
    currentUser.following.push(targetEmail);
    await user.save();
    await currentUser.save();
  }

  return NextResponse.json({ success: true });
}
