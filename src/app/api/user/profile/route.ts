import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import  prisma  from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("✅ Session:", session)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      console.error("❌ User not found in DB")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("🧠 User Roles Length:", user.userRoles.length)

    if (user.userRoles.length === 0) {
      console.log("🚨 Assigning Admin role...")

      const adminRole = await prisma.role.findUnique({
        where: { name: "Admin" }
      })

      if (!adminRole) {
        console.error("❌ Admin role not found in roles table")
        return NextResponse.json({ error: "Admin role not found" }, { status: 500 })
      }

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id
        }
      })

      // Re-fetch with updated role
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          userRoles: {
            include: { role: true }
          }
        }
      })
    }

    const primaryRole = user.userRoles[0]?.role ?? {
      id: null,
      name: "User",
      description: null
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: primaryRole,
      lastLogin: user.emailVerified ?? null
    })
  } catch (error: any) {
    console.error("🔥 Fatal API Error:", error.message)
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is changing and already taken
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        email,
      },
    })

    return NextResponse.json({ message: 'Profile updated', user: updatedUser })

  } catch (error) {
    console.error('🔥 PUT /api/user/profile error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}