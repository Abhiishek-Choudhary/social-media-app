'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">Welcome to the App</h1>
        <p className="text-gray-600">Please log in to continue</p>

        <button
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
        >
          Sign in with GitHub
        </button>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
