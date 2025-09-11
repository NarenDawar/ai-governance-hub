import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/signin",
  },
})

// --- MODIFIED: Update protected routes ---
export const config = { 
  matcher: [
    "/inventory/:path*", // Protect the new inventory route
    "/dashboard/:path*",
    "/vendors/:path*", 
    "/settings/:path*",
    "/assets/:path*", 
    "/assessments/:path*"
  ] 
};