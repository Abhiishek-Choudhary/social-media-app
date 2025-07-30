"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface PostFormProps {
  onPostSuccess?: () => void;
}

export default function PostForm({ onPostSuccess }: PostFormProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data: session } = useSession();

  const isVideo = (f: File | null) => f?.type.startsWith("video/");
  const isImage = (f: File | null) => f?.type.startsWith("image/");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewURL(url);

      return () => URL.revokeObjectURL(url); // clean up
    }
  }, [file]);

  const handleUpload = async (): Promise<{ image?: string; video?: string } | null> => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadType = isVideo(file) ? "video" : "image";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${uploadType}/upload`;

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data?.secure_url) {
        return uploadType === "video"
          ? { video: data.secure_url }
          : { image: data.secure_url };
      } else {
        console.error("Cloudinary upload failed");
        return null;
      }
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !session?.user?.email || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const media = await handleUpload();

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.email,
          content,
          ...media,
        }),
      });

      if (res.ok) {
        setContent("");
        setFile(null);
        setMessage("✅ Post submitted!");
        onPostSuccess?.();
      } else {
        setMessage("❌ Failed to post.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border p-2 rounded resize-none min-h-[80px]"
      />

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full mt-2"
      />

      {/* Preview */}
      {previewURL && (
        <div className="mt-3">
          {isImage(file) && (
            <img
              src={previewURL}
              alt="Preview"
              className="max-h-[200px] rounded border"
            />
          )}
          {isVideo(file) && (
            <video
              src={previewURL}
              controls
              className="max-h-[200px] rounded border"
            />
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>

      {message && <p className="text-sm mt-2 text-gray-600">{message}</p>}
    </form>
  );
}
