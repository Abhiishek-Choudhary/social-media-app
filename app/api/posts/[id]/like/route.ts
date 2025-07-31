import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email;

  // ✅ Extract postId from URL
  const postId = req.nextUrl.pathname.split("/")[3]; // /api/posts/[id]/like

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postOwner = await User.findOne({ email: post.userId }); // Assuming userId is email
    const recipientEmail = postOwner?.email;

    if (recipientEmail && recipientEmail !== userEmail) {
      await Notification.create({
        recipientEmail,
        senderEmail: userEmail,
        postId: post._id,
        type: "like",
      });
    }

    return NextResponse.json(post);
  } catch (err) {
    console.error("LIKE ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
