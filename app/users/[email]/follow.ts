import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { email: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserEmail = session.user.email;
  const targetEmail = decodeURIComponent(params.email);

  await connectDB();

  const user = await User.findOne({ email: targetEmail });
  const currentUser = await User.findOne({ email: currentUserEmail });

  if (!user || !currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Follow
  if (!user.followers.includes(currentUserEmail)) {
    user.followers.push(currentUserEmail);
    currentUser.following.push(targetEmail);
    await user.save();
    await currentUser.save();
  }

  return NextResponse.json({ success: true });
}
