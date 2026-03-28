import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getSessionUser, updateUser } from "@/lib/local-auth"
import type { UploadProfilePictureResponse } from "@/models/api"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/profiles")

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Authorization token required" } as UploadProfilePictureResponse,
        { status: 401 },
      )
    }
    const token = authHeader.split("Bearer ")[1]
    const sessionUser = await getSessionUser(token)
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Invalid or expired token" } as UploadProfilePictureResponse,
        { status: 401 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("profilePicture") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: "MISSING_DATA", message: "Profile picture file and user ID are required" } as UploadProfilePictureResponse,
        { status: 400 },
      )
    }

    if (sessionUser.uid !== userId) {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Cannot update another user's profile" } as UploadProfilePictureResponse,
        { status: 403 },
      )
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "INVALID_FILE_TYPE", message: "Please upload a valid image file (JPG, PNG, GIF, WebP)" } as UploadProfilePictureResponse,
        { status: 400 },
      )
    }

    const maxFileSize = 5 * 1024 * 1024
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { success: false, error: "FILE_TOO_LARGE", message: "Profile picture must be smaller than 5MB" } as UploadProfilePictureResponse,
        { status: 400 },
      )
    }

    // Delete old photo if it exists
    if (sessionUser.photoPath) {
      try {
        const oldPath = path.join(process.cwd(), "public", sessionUser.photoPath)
        await fs.unlink(oldPath)
      } catch {
        // Ignore errors deleting old file
      }
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `profile-${userId}-${timestamp}.${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const photoURL = `/uploads/profiles/${fileName}`
    const photoPath = `/uploads/profiles/${fileName}`

    await updateUser(userId, { photoURL, photoPath })

    return NextResponse.json(
      {
        success: true,
        message: "Profile picture updated successfully!",
        photoURL,
        photoPath,
      } as UploadProfilePictureResponse,
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in upload-profile-picture API:", error)
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "An internal server error occurred while uploading the profile picture" } as UploadProfilePictureResponse,
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
