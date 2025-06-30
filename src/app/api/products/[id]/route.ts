import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT: Update a product by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const { name, description, price, category } = await req.json()

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, category },
    })

    return NextResponse.json(product)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE: Delete a product by ID
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}