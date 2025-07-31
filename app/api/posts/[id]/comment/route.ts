import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "Missing comment text" }, { status: 400 });
  }

  // ✅ Extract post ID from URL
  const postId = req.nextUrl.pathname.split("/")[3]; // /api/posts/[id]/comment

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $push: {
        comments: {
          userId: session.user.email,
          text,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const postOwner = await User.findOne({ email: post.userId });
  const recipientEmail = postOwner?.email;

  if (recipientEmail && recipientEmail !== session.user.email) {
    await Notification.create({
      recipientEmail,
      senderEmail: session.user.email,
      postId: post._id.toString(),
      type: "comment",
      commentText: text,
    });
  }

  return NextResponse.json(post);
}
