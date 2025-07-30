"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const StoryViewer = dynamic(() => import("./StoryViewer"), { ssr: false });

interface Story {
  _id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
  username?: string;
  userImage?: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Record<string, Story[]>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    const res = await fetch("/api/stories");
    const data: Story[] = await res.json();

    const grouped = data.reduce((acc, story) => {
      acc[story.userId] = acc[story.userId] || [];
      acc[story.userId].push(story);
      return acc;
    }, {} as Record<string, Story[]>);

    setStories(grouped);
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Optional: expose this function to parent
  (globalThis as any).reloadStories = fetchStories;

  return (
    <>
      <div className="flex space-x-3 overflow-x-auto p-2 bg-white rounded shadow">
        {Object.entries(stories).map(([userId, userStories]) => (
          <div
            key={userId}
            className="w-20 text-center cursor-pointer"
            onClick={() => setSelectedUser(userId)}
          >
            <img
              src={userStories[0]?.mediaUrl}
              alt="story"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        ))}
      </div>

      {selectedUser && (
        <StoryViewer
          stories={stories[selectedUser]}
          user={{
            username: stories[selectedUser][0]?.username,
            image: stories[selectedUser][0]?.userImage,
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
