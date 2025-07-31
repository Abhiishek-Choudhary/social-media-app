// app/api/users/[email]/follow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  await connectDB();

  const followerEmail = req.nextUrl.searchParams.get("follower");
  const targetEmail = decodeURIComponent(params.email);

  if (!followerEmail || !targetEmail) {
    return NextResponse.json({ error: "Missing emails" }, { status: 400 });
  }

  await User.updateOne(
    { email: targetEmail },
    { $addToSet: { followers: followerEmail } }
  );

  return NextResponse.json({ message: "Followed successfully" });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  await connectDB();

  const followerEmail = req.nextUrl.searchParams.get("follower");
  const targetEmail = decodeURIComponent(params.email);

  if (!followerEmail || !targetEmail) {
    return NextResponse.json({ error: "Missing emails" }, { status: 400 });
  }

  await User.updateOne(
    { email: targetEmail },
    { $pull: { followers: followerEmail } }
  );

  return NextResponse.json({ message: "Unfollowed successfully" });
}
