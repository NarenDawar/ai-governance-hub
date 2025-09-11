'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    // If the user is signed in, show their info and a sign-out button
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            {session.user?.image && (
                <Image 
                    src={session.user.image} 
                    alt={session.user.name || 'User avatar'}
                    width={32}
                    height={32}
                    className="rounded-full"
                />
            )}
            <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
        </div>
        <button
          // --- THIS IS THE KEY CHANGE ---
          // Tell NextAuth to redirect to the landing page after signing out
          onClick={() => signOut({ callbackUrl: '/' })}
          // -----------------------------
          className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition text-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // If the user is not signed in, show a sign-in button
  return (
    <button 
      onClick={() => signIn('google', { callbackUrl: '/inventory' })}
      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition text-sm"
    >
      Sign In with Google
    </button>
  );
}