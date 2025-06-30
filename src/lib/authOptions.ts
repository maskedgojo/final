// lib/authOptions.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logToFile } from './logger';


// Extend the Session user type to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      dob?: string | null;
      address?: string | null;
    }
  }

  interface User {
    dob?: string | null;
    address?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    dob?: string | null;
    address?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },


async authorize(credentials) {
  try {
    // Validate inputs
    if (!credentials?.email || !credentials?.password) {
      await logToFile('warn', 'Missing email or password during login attempt', {
        origin: 'authOptions.authorize',
        email: credentials?.email ?? 'undefined'
      });
      return null;
    }

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      await logToFile('warn', `Login failed: No user found with email ${credentials.email}`, {
        origin: 'authOptions.authorize'
      });
      return null;
    }

    // Compare passwords
    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      await logToFile('warn', `Login failed: Invalid password for email ${credentials.email}`, {
        origin: 'authOptions.authorize',
        userId: user.id
      });
      return null;
    }

    // Successful login
    await logToFile('info', `User "${credentials.email}" authenticated successfully`, {
      origin: 'authOptions.authorize',
      userId: user.id
    });

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      dob: user.dob,
      address: user.address
    };

  } catch (err: any) {
    await logToFile('error', `Unexpected error during authorize()`, {
      error: err.message,
      stack: err.stack,
      origin: 'authOptions.authorize',
      email: credentials?.email ?? 'unknown'
    });
    return null;
  }
}

    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.dob = user.dob ?? null;
        token.address = user.address ?? null;
      }
      console.log(token);
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = String(token.id);
        session.user.dob = token.dob ?? null;
        session.user.address = token.address ?? null;
      }
      return session;
    },
    async signIn({ user }) {
    logToFile('info', `User "${user.email}" logged in`, { origin: 'login' });
    return true;
  }
  },
  events: {
    async signOut({ token }) {
      logToFile('info', `User "${token?.email}" logged out`, {
        origin: 'auth/signOut',
      });
    },
    async createUser({ user }) {
      logToFile('info', `User "${user.email}" registered`, {
        origin: '/register',
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET
}

