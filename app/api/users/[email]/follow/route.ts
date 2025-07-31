// app/api/users/[email]/follow/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Utility to extract email from pathname
function getTargetEmail(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split("/");
  const email = parts[parts.length - 2]; // 'follow' is last, email is before
  return email ? decodeURIComponent(email) : null;
}

export async function POST(req: NextRequest) {
  await connectDB();

  const followerEmail = req.nextUrl.searchParams.get("follower");
  const targetEmail = getTargetEmail(req);

  if (!followerEmail || !targetEmail) {
    return NextResponse.json({ error: "Missing emails" }, { status: 400 });
  }

  await User.updateOne(
    { email: targetEmail },
    { $addToSet: { followers: followerEmail } }
  );

  return NextResponse.json({ message: "Followed successfully" });
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  const followerEmail = req.nextUrl.searchParams.get("follower");
  const targetEmail = getTargetEmail(req);

  if (!followerEmail || !targetEmail) {
    return NextResponse.json({ error: "Missing emails" }, { status: 400 });
  }

  await User.updateOne(
    { email: targetEmail },
    { $pull: { followers: followerEmail } }
  );

  return NextResponse.json({ message: "Unfollowed successfully" });
}
