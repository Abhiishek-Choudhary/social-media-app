// components/ChatButton.tsx
import { useRouter } from "next/navigation";

export default function ChatButton() {
  const router = useRouter();

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => router.push("/chat")}
    >
      Open Chat
    </button>
  );
}
