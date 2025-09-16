import { Role } from "@prisma/client"; // Import the Role enum

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      organizationId?: string | null
      role?: Role // <-- ADD THIS LINE
    }
  }

  interface User {
    id: string
    role?: Role // <-- ADD THIS LINE
  }
}