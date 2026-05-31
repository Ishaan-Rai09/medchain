import { getUsersCollection } from "@/lib/mongo"
import type { AuthRole } from "@/lib/mongo"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const usersCollection = await getUsersCollection()
        const user = await usersCollection.findOne({ email })

        if (!user?.passwordHash) {
          return null
        }

        const passwordMatches = await compare(password, user.passwordHash)

        if (!passwordMatches) {
          return null
        }

        if (user.status !== "ACTIVE" && user.status !== "PENDING") {
          return null
        }

        const userId = user._id?.toString() ?? user.email

        return {
          id: userId,
          email: user.email,
          name: user.name ?? user.orgName ?? user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user && typeof user.role === "string") {
        token.role = user.role
      }

      // Ensure token contains an expiry for server-side checks (rotate on sign-in)
      const now = Math.floor(Date.now() / 1000)
      const maxAge = 60 * 60 // 1 hour
      if (!token.exp || (user && token.iat && now - (token.iat as number) > maxAge)) {
        token.iat = now
        token.exp = now + maxAge
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && typeof token.role === "string") {
        session.user.role = token.role as AuthRole
      }

      // Attach expiry to session object for client-side UI
      if (token.exp) {
        session.expires = new Date((token.exp as number) * 1000).toISOString()
      }

      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 15 * 60, // 15 minutes
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
