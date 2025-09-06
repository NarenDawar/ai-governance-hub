import { withAuth } from "next-auth/middleware"

// This is the middleware that protects our routes.
// We are now configuring it to use our custom sign-in page.
export default withAuth({
  pages: {
    signIn: "/signin", // Redirect users to our custom sign-in page
  },
})

// This config specifies which routes to protect. We are protecting everything
// EXCEPT the sign-in page. This is crucial to prevent the redirect loop.
export const config = { matcher: [
    "/", 
    "/dashboard/:path*",
    "/vendors/:path*", 
    "/settings/:path*",
    "/assets/:path*", 
    "/assessments/:path*"
] };

