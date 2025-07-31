import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email;

  try {
    // ✅ Increment likes
    const post = await Post.findByIdAndUpdate(
      params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ✅ Get post owner's email using userId (which is stored as email)
    const postOwner = await User.findOne({ email: post.userId }); // 🔧 FIXED HERE
    const recipientEmail = postOwner?.email;

    // ✅ Create notification
    if (recipientEmail && recipientEmail !== userEmail) {
      await Notification.create({
        recipientEmail,
        senderEmail: userEmail,
        postId: post._id,
        type: "like",
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
