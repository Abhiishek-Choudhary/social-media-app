import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import ProfileUI from '@/components/ProfileUI';
import type { LeanUser } from '@/types/User';

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

  if (!userRaw) {
    redirect('/error');
  }

  const user: LeanUser = {
    _id: userRaw._id.toString(),
    email: userRaw.email,
    username: userRaw.username || '',
    bio: userRaw.bio || '',
    image: userRaw.image || '',
    followers: userRaw.followers || [],
  };

  const safeSession = {
    user: {
      email: session.user.email!,
      name: session.user.name ?? '',
      image: session.user.image ?? '',
    },
  };

  return <ProfileUI session={safeSession} user={user} />;
}
