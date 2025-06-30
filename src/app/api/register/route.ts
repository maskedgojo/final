import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password, dob, address } = await req.json()

    // Server-side validation
    if (!name?.trim() || !email?.trim() || !password || !dob || !address?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const parsedDob = new Date(dob)
    if (isNaN(parsedDob.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date of birth format' },
        { status: 400 }
      )
    }

    // Case-insensitive email check for MySQL
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(), // Normalize to lowercase for comparison
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(), // Store email in lowercase
        password: hashedPassword,
        dob: parsedDob,
        address: address.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        dob: true,
        address: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { message: 'Registration successful', user },
      { status: 201 }
    )
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}