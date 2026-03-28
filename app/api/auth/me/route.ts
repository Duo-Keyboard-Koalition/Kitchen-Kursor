import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser, SESSION_COOKIE } from "@/lib/local-auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 })
    }
    const user = await getSessionUser(token)
    if (!user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 })
    }
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: user.photoURL || null,
        createdAt: user.createdAt,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
