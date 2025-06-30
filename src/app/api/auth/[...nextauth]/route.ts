import NextAuth from "next-auth"
import { authOptions } from "@/lib/authOptions"

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  }
})

export { handler as GET, handler as POST }