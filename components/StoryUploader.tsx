'use client';

import { useState } from 'react';

export default function StoryUploader({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await res.json();

      // 2. Save story to DB
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mediaUrl: cloudinaryData.secure_url,
          mediaType: cloudinaryData.resource_type,
        }),
      });

      // 3. ✅ Trigger story reload without full page refresh
      if (typeof (globalThis as any).reloadStories === 'function') {
        (globalThis as any).reloadStories();
      }

      setFile(null);
      alert('Story uploaded successfully');
    } catch (err) {
      console.error('Story upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded shadow">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Story'}
      </button>
    </div>
  );
}
