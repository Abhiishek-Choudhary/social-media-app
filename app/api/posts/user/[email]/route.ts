import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(_: Request, { params }: { params: { email: string } }) {
  await connectDB();
  const decodedEmail = decodeURIComponent(params.email);
  const posts = await Post.find({ userId: decodedEmail }).sort({ createdAt: -1 });
  return NextResponse.json(posts);
}
