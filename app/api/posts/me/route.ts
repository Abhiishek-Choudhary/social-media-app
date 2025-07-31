import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

// Define the shape of your post
interface LeanPost {
  _id: { toString(): string };
  createdAt: Date;
  [key: string]: any;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const posts = await Post.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const serializedPosts = (posts as unknown as LeanPost[]).map((post) => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toString(),
    }));

    return NextResponse.json({ posts: serializedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
