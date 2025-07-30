import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } } // 👈 must match `[id]` in folder
) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text) {
    return NextResponse.json(
      { error: "Missing comment text" },
      { status: 400 }
    );
  }

  const post = await Post.findByIdAndUpdate(
    params.id,
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

  // ✅ CORRECT
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
