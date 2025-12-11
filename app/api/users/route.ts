import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getAuthToken, generateToken } from "@/lib/auth"

export async function GET() {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user
    const currentUser = await sql`SELECT * FROM users WHERE token = ${token}`
    if (currentUser.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get all users except current user
    const users = await sql`
      SELECT id, email, created_at 
      FROM users 
      WHERE id != ${currentUser[0].id} 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users, currentUser: currentUser[0] })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newToken = generateToken()
    const newUser = await sql`
      INSERT INTO users (email, token) 
      VALUES (${email}, ${newToken}) 
      RETURNING id, email, created_at
    `

    return NextResponse.json({ user: newUser[0] })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
