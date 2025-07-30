"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditProfile from "./EditProfile";
import MyPosts from "./MyPosts";
import Image from 'next/image';

interface ProfileUIProps {
  session: {
    user: {
      email: string;
      name?: string;
      image?: string;
    };
  };
  user: {
    email: string;
    username?: string;
    name?: string;
    bio?: string;
    image?: string;
    followers: string[]; // Ensure this is an array of emails
  };
}

export default function ProfileUI({ session, user }: ProfileUIProps) {
  const [editing, setEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(
    user.followers?.length || 0
  );

  const sessionEmail = session?.user?.email;
  const isOwner = sessionEmail === user?.email;

  const router = useRouter();

  const handleProfileUpdate = () => {
    setEditing(false);
    router.refresh(); // ✅ Refresh the current page
  };

  useEffect(() => {
    if (!isOwner && Array.isArray(user.followers) && sessionEmail) {
      setIsFollowing(user.followers.includes(sessionEmail));
    }
  }, [user.followers, sessionEmail, isOwner]);

  const handleFollow = async () => {
    const res = await fetch(
      `/api/users/${user.email}/follow?follower=${sessionEmail}`,
      { method: "POST" }
    );
    if (res.ok) {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const handleUnfollow = async () => {
    const res = await fetch(
      `/api/users/${user.email}/follow?follower=${sessionEmail}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
    }
  };

  if (!session || !user) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isOwner ? "My Profile" : `${user.username || user.email}'s Profile`}
      </h1>

      <div className="bg-white p-4 shadow rounded mb-6 flex items-center gap-4">
        {user.image && (
          <Image
            src={user.image}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
        )}
        <div className="flex-1">
          <p className="font-semibold text-lg">{user.username || user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.bio && <p className="mt-1 text-sm text-gray-600">{user.bio}</p>}
          <p className="mt-1 text-sm text-gray-700">
            Followers: {followerCount}
          </p>
        </div>

        {/* Buttons */}
        {isOwner ? (
          <button
            onClick={() => setEditing((prev) => !prev)}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        ) : sessionEmail ? (
          isFollowing ? (
            <button
              onClick={handleUnfollow}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Unfollow
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Follow
            </button>
          )
        ) : null}
      </div>

      {editing && isOwner && (
        <div className="mb-6">
          <EditProfile user={user} onProfileUpdate={handleProfileUpdate}/>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Posts</h2>
      {isOwner || isFollowing ? (
        <MyPosts sessionEmail={user.email} />
      ) : (
        <p className="text-gray-500">Follow this user to see their posts.</p>
      )}
    </main>
  );
}
