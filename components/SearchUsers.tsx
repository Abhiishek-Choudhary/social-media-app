// components/SearchUsers.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface User {
  email: string;
  username?: string;
  image?: string;
}

export default function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or username"
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={searchUsers}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500 mt-2">Searching...</p>}

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((user) => (
            <Link
              key={user.email}
              href={`/users/${encodeURIComponent(user.email)}`}
              className="block text-blue-600 hover:underline"
            >
              {user.username || user.email}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
