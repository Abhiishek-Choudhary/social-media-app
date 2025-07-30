"use client"

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostForm from '@/components/PostForm';
import Feed from '@/components/Feed';
import Stories from '@/components/Stories';
import StoryUploader from "@/components/StoryUploader";
import SearchUsers from '@/components/SearchUsers';
import NotificationButton from '@/components/NotificationButton';
import ChatButton from '@/components/ChatButton';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  // const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     const res = await fetch('/api/notifications/unread');
  //     const data = await res.json();
  //     setUnreadCount(data.count || 0);
  //   };

  //   if (session?.user?.email) fetchNotifications();
  // }, [session]);

  if (status === 'loading') return <p className="text-center text-gray-500">Loading...</p>;
  if (!session) return null;

  return (
    <main className="max-w-xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <SearchUsers />
        {/* <Link href="/notifications">
          <button className="relative text-sm px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </Link> */}
        <NotificationButton/>
        <ChatButton/>
      </div>

      {session?.user?.email && <StoryUploader userId={session.user.email} />}
      <Stories />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Feed</h1>
        <Link href="/profile">
          <button className="text-sm px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">My Profile</button>
        </Link>
      </div>

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {showForm ? 'Cancel' : 'Post Something'}
      </button>

      {showForm && <PostForm onPostSuccess={() => setTimeout(() => location.reload(), 100)} />}
      <Feed />
    </main>
  );
}
