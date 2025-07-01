import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete associated userRoles first
    await prisma.userRole.deleteMany({ where: { userId: id } })

    // Then delete the user
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user. Please try again.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const { name, email, password, dob, address, roles } = await request.json()

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash new password if provided
    const hashedPassword = password?.trim()
      ? await bcrypt.hash(password, 10)
      : undefined

    // Update user basic details
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        password: hashedPassword || existingUser.password,
        dob: dob ? new Date(dob) : existingUser.dob,
        address
      }
    })

    // Update roles through userRole table
    if (Array.isArray(roles)) {
      // Remove existing roles
      await prisma.userRole.deleteMany({ where: { userId: id } })

      // Add new roles
      await prisma.userRole.createMany({
        data: roles.map((roleId: number) => ({
          userId: id,
          roleId
        })),
        skipDuplicates: true
      })
    }

    // Return updated user with roles
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        dob: true,
        address: true,
        createdAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user. Please try again.' },
      { status: 500 }
    )
  }
}
