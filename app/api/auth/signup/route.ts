import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession, SESSION_COOKIE, COOKIE_OPTIONS } from "@/lib/local-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()
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
    return NextResponse.json(
      { success: false, error: error.code || "SERVER_ERROR", message: error.message },
      { status: 400 },
    )
  }
}
