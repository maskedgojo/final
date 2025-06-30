import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Return all unique permission keys used in any role
export async function GET() {
  const roles = await prisma.role.findMany({
    select: { permissions: true }
  })

  const allPermissions = new Set<string>()

  roles.forEach(role => {
    if (role.permissions) {
      Object.entries(role.permissions).forEach(([key, value]) => {
        if (value) allPermissions.add(key)
      })
    }
  })

  return NextResponse.json([...allPermissions])
}

// POST: Add a new permission key by assigning it to a role
export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name) {
    return NextResponse.json({ error: 'Permission name is required' }, { status: 400 })
  }

  // Try to find any role
  let role = await prisma.role.findFirst()

  // If no roles exist, create a dummy one
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: 'placeholder',
        description: 'Auto-created role for holding permissions',
        permissions: { [name]: true },
      }
    })
  } else {
    // Update the existing role with the new permission
    const updatedPermissions = {
      ...(role.permissions || {}),
      [name]: true,
    }

    await prisma.role.update({
      where: { id: role.id },
      data: { permissions: updatedPermissions },
    })
  }

  return NextResponse.json({ message: `Permission "${name}" added` })
}

// DELETE: Remove a permission key from all roles
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Permission name is required' }, { status: 400 })
  }

  const roles = await prisma.role.findMany()

  await Promise.all(
    roles.map(role => {
      const updatedPermissions = { ...(role.permissions || {}) }
      delete updatedPermissions[name]

      return prisma.role.update({
        where: { id: role.id },
        data: { permissions: updatedPermissions },
      })
    })
  )

  return NextResponse.json({ message: `Permission "${name}" deleted from all roles` })
}
