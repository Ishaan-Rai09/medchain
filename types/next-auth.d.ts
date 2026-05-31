import type { DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"

type AuthRole = "GOVERNMENT" | "MANUFACTURER" | "PHARMACY" | "CONSUMER"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string
      role?: AuthRole
    }
  }

  interface User {
    role?: AuthRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AuthRole
  }
}
