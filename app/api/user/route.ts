// app/api/user/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { username, bio } = await req.json();

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    { username, bio },
    { upsert: true, new: true }
  );

  return NextResponse.json(updated);
}
