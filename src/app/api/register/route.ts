import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    console.log('Registration request body:', JSON.stringify(body, null, 2))

    // Validate required fields
    const { name, email, password, dob, address } = body
    if (!name || !email || !password || !dob || !address) {
      console.error('Missing required fields')
      return NextResponse.json(
        { 
          success: false,
          error: 'All fields are required',
          missingFields: {
            name: !name,
            email: !email,
            password: !password,
            dob: !dob,
            address: !address
          }
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully')

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dob: new Date(dob),
        address
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    console.log('User created successfully:', user)
    return NextResponse.json(
      { 
        success: true,
        user,
        message: 'Registration successful' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Server error:', error)
    
    // Return detailed error in development
    const errorResponse = {
      success: false,
      error: 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    }

    return NextResponse.json(errorResponse, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}