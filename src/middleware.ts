import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { Role } from "@prisma/client"; // Import the Role enum

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;
    
    // --- ONBOARDING LOGIC (No changes) ---
    const userIsOnboarding = !token?.organizationId;
    const isOnboardingPage = pathname.startsWith('/welcome');

    if (userIsOnboarding && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }
    
    if (!userIsOnboarding && isOnboardingPage) {
      return NextResponse.redirect(new URL('/inventory', request.url));
    }

    // --- NEW: RBAC LOGIC ---
    const isAdminRoute = pathname.startsWith('/settings');
    const userIsAdmin = token?.role === Role.ADMIN;

    // If a non-admin tries to access an admin-only route, redirect them.
    if (isAdminRoute && !userIsAdmin) {
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

export const config = { 
  matcher: [
    "/inventory/:path*",
    "/dashboard/:path*",
    "/vendors/:path*", 
    "/settings/:path*", // This already correctly includes the templates route
    "/assets/:path*", 
    "/assessments/:path*",
    "/welcome",
  ] 
};