// app/api/search-users/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  await connectDB();

  const regex = new RegExp(query, 'i'); // case-insensitive search

  const users = await User.find({
    $or: [{ email: regex }, { username: regex }],
  })
    .select('email username image -_id')
    .limit(10);

  return NextResponse.json(users);
}
