import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getAuthToken, setAuthToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const user = await sql`SELECT * FROM users WHERE id = ${id}`

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await setAuthToken(user[0].token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Switch user error:", error)
    return NextResponse.json({ error: "Failed to switch user" }, { status: 500 })
  }
}
