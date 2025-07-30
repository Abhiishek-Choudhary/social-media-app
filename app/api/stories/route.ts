import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Story from "@/models/Story";
import User, { IUser } from "@/models/User";

// POST: Create a story
export async function POST(request: Request) {
  await connectDB();
  const { userId, mediaUrl, mediaType } = await request.json();

  if (!userId || !mediaUrl || !mediaType) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const user = await User.findOne({ email: userId });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const story = await Story.create({
    userId,
    mediaUrl,
    mediaType,
    username: user.username,
    userImage: user.image,
  });

  return NextResponse.json(story, { status: 201 });
}

// GET: Fetch followed users' non-expired stories (and user's own)
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user?.email }).lean() as IUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followedEmails = [...(user.followers || []), user.email];

    const stories = await Story.find({
      userId: { $in: followedEmails },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean();

    const userMap = await User.find({
      email: { $in: followedEmails },
    }).lean();

    const emailToUser: Record<string, { username?: string; image?: string }> = {};
    userMap.forEach((u) => {
      emailToUser[u.email] = {
        username: u.username,
        image: u.image,
      };
    });

    const enrichedStories = stories.map((story) => ({
      ...story,
      username: emailToUser[story.userId]?.username || story.userId,
      userImage: emailToUser[story.userId]?.image || "",
    }));

    return NextResponse.json(enrichedStories);
  } catch (error) {
    console.error("Error loading stories:", error);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}
