import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession, SESSION_COOKIE, COOKIE_OPTIONS } from "@/lib/local-auth"

const AUTH_ERROR_CODES = new Set([
  "auth/email-already-in-use",
  "auth/weak-password",
  "MISSING_FIELDS",
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "MISSING_FIELDS", message: "Email and password are required" },
        { status: 400 },
      )
    }

    const user = await createUser(email, password, firstName || "", lastName || "")
    const token = await createSession(user.uid)

    const res = NextResponse.json(
      {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photoURL: null,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    )
    res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS)
    return res
  } catch (error: any) {
    const isAuthError = AUTH_ERROR_CODES.has(error.code)
    return NextResponse.json(
      { success: false, error: error.code || "SERVER_ERROR", message: error.message },
      { status: isAuthError ? 400 : 500 },
    )
  }
}
