// DELETE /api/stories/cleanup
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';

export const DELETE = async () => {
  await connectDB();
  const result = await Story.deleteMany({ expiresAt: { $lte: new Date() } });
  return NextResponse.json({ deleted: result.deletedCount });
};
