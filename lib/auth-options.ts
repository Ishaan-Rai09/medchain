import { getUsersCollection } from "@/lib/mongo"
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
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
