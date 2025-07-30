import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

  // Find and update the post
  const post = await Post.findByIdAndUpdate(
    params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Get the post owner's email using the userId from post
  const postOwner = await User.findById(post.userId);
  const recipientEmail = postOwner?.email;

  // Create a notification if the user liking the post is not the owner
  if (recipientEmail && recipientEmail !== userEmail) {
    await Notification.create({
      recipientEmail,                      // recipient of the notification
      senderEmail: userEmail,              // liker (sender)
      postId: post._id,                    // the liked post
      type: "like",                        // type of notification
    });
  }

  return NextResponse.json(post);
}
