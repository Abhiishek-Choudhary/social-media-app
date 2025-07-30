"use client";

import { useEffect, useState } from "react";

type Notification = {
  sender: string;
  recipient: string;
  postId: string;
  type: "like" | "comment";
  createdAt: string;
  commentText?: string; // ✅ Optional comment text
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const getNotifications = async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications);
    };

    const markAsRead = async () => {
      await fetch("/api/notifications/mark-as-read", {
        method: "POST",
      });
    };

    getNotifications();
    markAsRead();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {notifications.map((n, index) => (
            <li key={index} className="mb-4 border-b pb-2">
              <div>
                <strong>{n.senderEmail}</strong>{" "}
                {n.type === "like"
                  ? "liked your post"
                  : `commented on your post:`}
              </div>
              {n.type === "comment" && n.commentText && (
                <div className="ml-4 mt-1 text-gray-700">“{n.commentText}”</div>
              )}
              <div className="text-sm text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
