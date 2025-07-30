'use client';

import { useState } from 'react';

interface EditProfileProps {
  user: {
    email: string;
    username?: string;
    bio?: string;
  };
  onProfileUpdate: () => void; // 👈 Callback to trigger page refresh
}

export default function EditProfile({ user, onProfileUpdate }: EditProfileProps) {
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email, // 👈 Include email
        username,
        bio,
      }),
    });

    setSaving(false);

    if (res.ok) {
      onProfileUpdate(); // 👈 Refresh page on successful save
    } else {
      console.error('Failed to save profile');
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Edit Profile</h3>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full border p-2 rounded mb-2"
      />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleSave}
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
