'use client';

import { useSession } from 'next-auth/react';
// 1. Import useSearchParams to read URL parameters
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import AuthButton from '@/components/AuthButton';

// This is the dedicated, unprotected sign-in page.
function SignInPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // 2. Get the search params from the URL
  const searchParams = useSearchParams();

  // --- THIS IS THE KEY CHANGE ---
  // This effect will run whenever the session status changes.
  useEffect(() => {
    // If the session is authenticated, redirect the user away from the sign-in page.
    if (status === 'authenticated') {
      // 3. Get the callbackUrl from the search params, or default to a safe page like '/dashboard'
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.push(callbackUrl);
    }
  }, [session, status, router, searchParams]); // 4. Add searchParams to the dependency array
  // -----------------------------

  // Show a loading state while the session is being checked
  if (status === 'loading') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <p>Loading...</p>
        </div>
    );
  }

  // Only show the sign-in form if the user is unauthenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            AI Governance Hub
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access the platform.
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  // Render nothing while redirecting
  return null;
}

// Wrap the component that uses useSearchParams in Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p>Loading...</p>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
}