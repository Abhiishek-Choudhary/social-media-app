import { connectDB } from '@/lib/mongodb';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  try {
    await Post.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { content } = await req.json();

  try {
    const updated = await Post.findByIdAndUpdate(
      params.id,
      { content },
      { new: true }
    );
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
