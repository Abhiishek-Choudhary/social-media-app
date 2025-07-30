'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
// import PostForm from "./PostForm";
import Image from 'next/image';

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

export default function Feed() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [visibleComments, setVisibleComments] = useState<{ [key: string]: boolean }>({});

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid post format");
      setPosts(data);
      setError(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    fetchPosts();
  };

  const handleComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !session?.user?.email) return;

    await fetch(`/api/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.email, text }),
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  if (loading) return <p className="text-center text-gray-500">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load posts.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Latest Posts</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="bg-white p-4 shadow-xl rounded">
            <p className="text-gray-900 mb-2 whitespace-pre-wrap">{post.content}</p>

            {post.image && !post.video && (
              <Image
                src={post.image}
                alt="Post"
                width={320}
                height={400}
                className="rounded max-h-[400px] object-cover w-full mt-2"
              />
            )}
            {post.video && (
              <video
                controls
                src={post.video}
                className="rounded w-full max-h-[400px] object-cover mt-2"
              />
            )}

            <div className="text-sm text-gray-500 mt-2">
              Posted by{" "}
              <Link href={`/users/${encodeURIComponent(post.userId)}`}>
                <span className="font-medium text-blue-600 hover:underline">
                  {post.userId}
                </span>
              </Link>
              <br />
              on {new Date(post.createdAt).toLocaleString()}
            </div>

            <div className="mt-3 flex gap-4 text-sm">
              <button
                onClick={() => handleLike(post._id)}
                className="text-blue-600 cursor-pointer"
              >
                ❤️ Like ({post.likes})
              </button>
              <button
                onClick={() => toggleComments(post._id)}
                className="text-gray-600 cursor-pointer"
              >
                💬 Comment ({post.comments.length})
              </button>
            </div>

            {visibleComments[post._id] && (
              <div className="mt-4 border-t pt-4">
                <div className="mb-2 space-y-2 text-sm text-gray-700">
                  {post.comments.length === 0 ? (
                    <p className="text-gray-500 italic">No comments yet.</p>
                  ) : (
                    post.comments.map((comment, index) => (
                      <p key={index}>
                        <strong className="text-blue-600">{comment.userId}</strong>:{" "}
                        {comment.text}
                      </p>
                    ))
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  className="border px-3 py-1 text-sm rounded w-full mt-2"
                />
                <button
                  onClick={() => handleComment(post._id)}
                  className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Post Comment
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
