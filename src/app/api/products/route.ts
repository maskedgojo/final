
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST: Create a new product
export async function POST(req: Request) {
  try {
    const { name, description, price, category } = await req.json()

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: { name, description, price, category },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}