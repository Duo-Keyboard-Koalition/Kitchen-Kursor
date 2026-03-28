import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser, updateUser, SESSION_COOKIE } from "@/lib/local-auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 })
    }
    const sessionUser = await getSessionUser(token)
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 })
    }
    const { firstName, lastName } = await request.json()
    await updateUser(sessionUser.uid, { firstName, lastName })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "SERVER_ERROR", message: error.message }, { status: 500 })
  }
}
