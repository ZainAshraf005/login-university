import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateToken, setAuthToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existingUser.length > 0) {
      // User exists, use existing token
      await setAuthToken(existingUser[0].token);
      return NextResponse.json({ user: existingUser[0] });
    }

    // Create new user
    const token = generateToken();
    const newUser = await sql`
      INSERT INTO users (email, token) 
      VALUES (${email}, ${token}) 
      RETURNING *
    `;

    await setAuthToken(token);
    return NextResponse.json({ user: newUser[0] });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
