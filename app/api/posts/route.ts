import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

// Define post type structure
interface LeanPost {
  _id: any;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: any[];
  createdAt: Date;
}

export async function GET() {
  try {
    await connectDB();

    const posts = (await Post.find().sort({ likes: -1 }).lean()) as unknown as LeanPost[];

    const serializedPosts = posts.map((post) => ({
      _id: post._id.toString(),
      userId: post.userId,
      content: post.content,
      image: post.image || null,
      video: post.video || null,
      likes: post.likes || 0,
      comments: post.comments || [],
      createdAt: post.createdAt.toString(),
    }));

    return NextResponse.json(serializedPosts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, content, image, video } = await req.json();

    console.log("Saving post with:", { userId, content, image, video });

    if (!userId || !content) {
      return NextResponse.json({ error: 'Missing userId or content' }, { status: 400 });
    }

    await connectDB();

    const newPost = await Post.create({
      userId,
      content,
      image: image || null,
      video: video || null,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
