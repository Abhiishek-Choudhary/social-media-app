// app/api/posts/me/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import Post from '@/models/Post';
import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const posts = await Post.find({ userId: session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  const serializedPosts = posts.map((post) => ({
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt.toString(),
  }));

  return NextResponse.json(serializedPosts);
}
