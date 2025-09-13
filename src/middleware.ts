import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;
    
    const userIsOnboarding = !token?.organizationId;
    const isOnboardingPage = pathname.startsWith('/welcome');

    // If the user has no organization and is NOT on the welcome page,
    // redirect them to the welcome page.
    if (userIsOnboarding && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }
    
    // If the user HAS an organization but is trying to access the welcome page,
    // redirect them to the main app (inventory).
    if (!userIsOnboarding && isOnboardingPage) {
      return NextResponse.redirect(new URL('/inventory', request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/signin",
    },
  }
);

// This config specifies which routes are protected by the middleware.
export const config = { 
  matcher: [
    "/inventory/:path*",
    "/dashboard/:path*",
    "/vendors/:path*", 
    "/settings/:path*",
    "/assets/:path*", 
    "/assessments/:path*",
    "/welcome", // Protect the welcome page too
  ] 
};