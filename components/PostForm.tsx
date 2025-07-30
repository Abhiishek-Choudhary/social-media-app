"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

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

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleUpload = async (): Promise<{
    image?: string;
    video?: string;
  } | null> => {
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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md border space-y-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[100px]"
      />

      {/* File Input */}
      <label
        htmlFor="media-upload"
        className="flex items-center gap-2 cursor-pointer w-fit bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition"
      >
        <Upload className="w-4 h-4" />
        {file ? file.name : "Upload Image or Video"}
      </label>
      <input
        id="media-upload"
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
      />

      {/* Preview */}
      {previewURL && (
        <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-300 max-h-[240px]">
          {isImage(file) && (
            <Image
              src={previewURL}
              alt="Preview"
              width={600}
              height={400}
              className="object-contain w-full h-auto"
            />
          )}
          {isVideo(file) && (
            <video
              src={previewURL}
              controls
              className="w-full h-full object-contain"
            />
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Posting..." : "Post"}
      </button>

      {message && (
        <p
          className={`text-sm mt-1 ${
            message.startsWith("✅")
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
