'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Comment {
  userId: string;
  text: string;
}

interface Post {
  _id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

interface PostItemProps {
  post: Post;
  sessionEmail: string;
  onUpdate?: () => void;
}

export default function PostItem({ post, sessionEmail, onUpdate }: PostItemProps) {
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const deletePost = async () => {
    try {
      await fetch(`/api/posts/${post._id}`, { method: 'DELETE' });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const updatePost = async () => {
    try {
      await fetch(`/api/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      setEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleLike = async () => {
    try {
      await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionEmail, text: commentText }),
      });
      setCommentText('');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  return (
    <div className="bg-white p-4 shadow-xl rounded mb-6">
      {editing ? (
        <>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={updatePost}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2">{post.content}</p>

          {post.image && (
            <div className="relative w-full h-72 mt-2 rounded overflow-hidden">
              <Image
                src={post.image}
                alt="Post Image"
                fill
                className="object-cover"
              />
            </div>
          )}

          {post.video && (
            <video
              controls
              src={post.video}
              className="mt-2 max-h-[400px] object-cover rounded w-full"
            />
          )}

          <p className="text-sm text-gray-500 mt-2">
            Posted on {new Date(post.createdAt).toLocaleString()}
          </p>

          <div className="mt-3 flex gap-6 items-center">
            <button
              onClick={handleLike}
              className="text-sm text-blue-600 cursor-pointer"
            >
              ❤️ Like ({post.likes || 0})
            </button>

            <button
              onClick={() => setShowComments((prev) => !prev)}
              className="text-sm text-gray-600 cursor-pointer"
            >
              💬 Comment ({post.comments?.length || 0})
            </button>
          </div>

          {showComments && (
            <div className="mt-4">
              <div className="mb-2 space-y-2 text-sm text-gray-700">
                {post.comments?.length ? (
                  post.comments.map((comment, index) => (
                    <p key={index}>
                      <strong>{comment.userId}:</strong> {comment.text}
                    </p>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>

              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border px-3 py-1 text-sm rounded w-full"
              />
              <button
                onClick={handleComment}
                className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Post Comment
              </button>
            </div>
          )}

          {post.userId === sessionEmail && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setEditing(true)}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={deletePost}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
