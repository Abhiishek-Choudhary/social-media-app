import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import ProfileUI from '@/components/ProfileUI'; // New client component

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  await connectDB();

  const userRaw = await User.findOneAndUpdate(
    { email: session.user.email },
    { $setOnInsert: { email: session.user.email } },
    { upsert: true, new: true }
  );

  const user = userRaw?.toObject
    ? { ...userRaw.toObject(), _id: userRaw._id.toString() }
    : userRaw;

  return <ProfileUI session={session} user={user} />;
}
