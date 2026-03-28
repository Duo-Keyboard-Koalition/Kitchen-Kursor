import { type NextRequest, NextResponse } from "next/server"
import { deleteSession, SESSION_COOKIE } from "@/lib/local-auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (token) await deleteSession(token)
  } catch {
    // best-effort
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" })
  return res
}
