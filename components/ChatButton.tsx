// components/ChatButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function ChatButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/chat")}
      className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
      aria-label="Open Chat"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
