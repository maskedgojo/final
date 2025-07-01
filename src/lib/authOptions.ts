// lib/authOptions.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import  prisma  from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logToFile } from './logger'

// Extend Session and JWT to include custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      dob?: string | null
      address?: string | null
      role?: string | null
    }
  }

  interface User {
    dob?: string | null
    address?: string | null
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string | null
    dob?: string | null
    address?: string | null
    role?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            await logToFile('warn', 'Missing email or password during login attempt', {
              origin: 'authOptions.authorize',
              email: credentials?.email ?? 'undefined',
            })
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              userRoles: {
                include: { role: true },
              },
            },
          })

          if (!user || !user.password) {
            await logToFile('warn', `Login failed: No user found with email ${credentials.email}`, {
              origin: 'authOptions.authorize',
            })
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            await logToFile('warn', `Login failed: Invalid password for email ${credentials.email}`, {
              origin: 'authOptions.authorize',
              userId: user.id,
            })
            return null
          }

          const primaryRole = user.userRoles[0]?.role?.name || 'User'

          await logToFile('info', `User "${credentials.email}" authenticated successfully`, {
            origin: 'authOptions.authorize',
            userId: user.id,
            role: primaryRole,
          })

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            dob: user.dob,
            address: user.address,
            role: primaryRole,
          }

        } catch (err: unknown) {
          let errorMessage = 'Unknown error';
          let errorStack = undefined;
          if (err && typeof err === 'object' && 'message' in err) {
            errorMessage = (err as { message: string }).message;
            errorStack = (err as { stack?: string }).stack;
          }
          await logToFile('error', 'Unexpected error during authorize()', {
            error: errorMessage,
            stack: errorStack,
            origin: 'authOptions.authorize',
            email: credentials?.email ?? 'unknown',
          })
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email ?? null
        token.dob = user.dob ?? null
        token.address = user.address ?? null
        token.role = user.role ?? 'User'
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = String(token.id)
        session.user.email = token.email ?? null
        session.user.dob = token.dob ?? null
        session.user.address = token.address ?? null
        session.user.role = token.role ?? 'User'
      }
      return session
    },

    async signIn({ user }) {
      await logToFile('info', `User "${user.email}" logged in`, {
        origin: 'authOptions.signIn',
      })
      return true
    },
  },

  events: {
    async signOut({ token }) {
      await logToFile('info', `User "${token?.email}" logged out`, {
        origin: 'authOptions.signOut',
      })
    },

    async createUser({ user }) {
      await logToFile('info', `User "${user.email}" registered`, {
        origin: 'authOptions.createUser',
      })
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}