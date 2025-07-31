import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(req: NextRequest) {
  await connectDB();

  // Extract the email param from the URL
  const email = req.nextUrl.pathname.split("/").pop();
  const decodedEmail = decodeURIComponent(email || "");

  const posts = await Post.find({ userId: decodedEmail }).sort({ createdAt: -1 });
  return NextResponse.json(posts);
}
