"use client";

import { useState } from "react";

export default function StoryUploader({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await res.json();

      if (!cloudinaryData.secure_url) {
        throw new Error("Failed to upload to Cloudinary");
      }

      // Extract width and height if image
      const width = cloudinaryData.width ?? null;
      const height = cloudinaryData.height ?? null;

      // Save story to DB
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mediaUrl: cloudinaryData.secure_url,
          mediaType: cloudinaryData.resource_type,
          width,
          height,
        }),
      });

      // Trigger story reload if available globally
      if (typeof globalThis.reloadStories === "function") {
        globalThis.reloadStories();
      }

      setFile(null);
      alert("✅ Story uploaded successfully!");
    } catch (err) {
      console.error("❌ Story upload failed:", err);
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded shadow">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFile(e.target.files?.[0] || null)
        }
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Story"}
      </button>
    </div>
  );
}
