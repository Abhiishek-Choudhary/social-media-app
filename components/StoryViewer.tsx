"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";

interface Story {
  _id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
}

interface StoryViewerProps {
  stories: Story[];
  onClose: () => void;
  user: { username?: string; image?: string };
}

export default function StoryViewer({
  stories,
  onClose,
  user,
}: StoryViewerProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const duration = 10000;

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startTimer = useCallback(() => {
    setProgress(0);
    const start = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);
    }, 100);

    timerRef.current = setTimeout(() => {
      if (current < stories.length - 1) {
        setCurrent((prev) => prev + 1);
      } else {
        onClose();
      }
    }, duration);
  }, [current, onClose, stories.length]);

  useEffect(() => {
    clearTimers();
    startTimer();
    return () => clearTimers();
  }, [current, startTimer]);

  const handlePrev = () => {
    if (current > 0) setCurrent((prev) => prev - 1);
  };

  const handleNext = () => {
    if (current < stories.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const story = stories[current];

  return (
    <div
      {...handlers}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
    >
      <div className="relative w-full max-w-md text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl z-20"
        >
          ✕
        </button>

        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-20">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          {user?.image && (
            <Image
              src={user.image}
              alt="user profile"
              width={32}
              height={32}
              className="rounded-full object-cover"
              unoptimized
            />
          )}
          <span className="text-sm font-medium">
            {user?.username || "User"}
          </span>
        </div>

        <div className="flex justify-between items-center px-4 mt-8">
          <button
            onClick={handlePrev}
            className="text-white text-3xl font-bold"
            disabled={current === 0}
          >
            ‹
          </button>

          <div className="w-72 h-96 mt-2 bg-black rounded overflow-hidden shadow-lg relative">
            {story.mediaType === "image" ? (
              <Image
                src={story.mediaUrl}
                alt="story"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <video
                src={story.mediaUrl}
                autoPlay
                muted={muted}
                controls
                className="w-full h-full object-cover"
                onClick={() => setMuted(false)}
              />
            )}
          </div>

          <button
            onClick={handleNext}
            className="text-white text-3xl font-bold"
            disabled={current === stories.length - 1}
          >
            ›
          </button>
        </div>

        <div className="text-center mt-3 text-sm text-gray-300">
          {current + 1} / {stories.length}
        </div>
      </div>
    </div>
  );
}
