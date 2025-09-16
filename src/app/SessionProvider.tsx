'use client';

import { SessionProvider as Provider } from 'next-auth/react';

// This is a client-side component that wraps our app to provide session context
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}