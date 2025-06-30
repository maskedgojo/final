// app/api/roles/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const roles = await prisma.role.findMany()
  return NextResponse.json(roles)
}

export async function POST(req: Request) {
  const data = await req.json()
  const role = await prisma.role.create({ data })
  return NextResponse.json(role)
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  const data = await req.json()

  const updated = await prisma.role.update({
    where: { id },
    data
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))

  await prisma.role.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'Deleted' })
}
