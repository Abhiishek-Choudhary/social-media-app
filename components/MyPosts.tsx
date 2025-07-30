'use client';

import { useEffect, useState } from 'react';
import PostItem from './PostItem';

interface Post {
  _id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  createdAt: string;
  likes: number;
  comments: { userId: string; text: string }[];
}

export default function MyPosts({ sessionEmail }: { sessionEmail: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts/user/${encodeURIComponent(sessionEmail)}`);
      if (!res.ok) throw new Error('Failed to fetch user posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionEmail) {
      fetchPosts();
    }
  }, [sessionEmail]);

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-gray-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">No posts to show.</p>
      ) : (
        posts.map((post) => (
          <PostItem
            key={post._id}
            post={post}
            sessionEmail={sessionEmail}
            onUpdate={fetchPosts}
          />
        ))
      )}
    </div>
  );
}
