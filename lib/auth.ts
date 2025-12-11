import { cookies } from "next/headers"

const TOKEN_COOKIE = "auth_token"

export async function setAuthToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value || null
}

export async function clearAuthToken() {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE)
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
