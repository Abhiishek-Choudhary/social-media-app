"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Link href="/notifications" className="relative text-xl">
      🔔
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
