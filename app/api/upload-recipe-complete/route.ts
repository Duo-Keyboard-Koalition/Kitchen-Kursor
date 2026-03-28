import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { UploadRecipeCompleteResponse, FirestoreRecord } from "@/models/api"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/recipes")
const DATABASE_FILE = path.join(process.cwd(), "data/recipes.json")
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function ensureDirectories() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.mkdir(path.dirname(DATABASE_FILE), { recursive: true })
}

async function readRecords(): Promise<FirestoreRecord[]> {
  try {
    const data = await fs.readFile(DATABASE_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeRecords(records: FirestoreRecord[]): Promise<void> {
  await fs.writeFile(DATABASE_FILE, JSON.stringify(records, null, 2), "utf-8")
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const imageFile = formData.get("image") as File
    const userId = formData.get("userId") as string
    const wasteSaver = formData.get("wasteSaver") === "true"
    const pcoBonus = parseInt((formData.get("pcoBonus") as string) || "0", 10)
    const costPerServingRaw = formData.get("costPerServing") as string | null
    const costPerServing = costPerServingRaw ? parseFloat(costPerServingRaw) : undefined

    if (!name || !description || !imageFile) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_FIELDS",
          message: "Name, description, and image file are required",
        } as UploadRecipeCompleteResponse,
        { status: 400 },
      )
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_FILE_TYPE",
          message: "Please upload a valid image file (JPG, PNG, GIF, WebP)",
        } as UploadRecipeCompleteResponse,
        { status: 400 },
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "FILE_TOO_LARGE",
          message: "Image file must be smaller than 10MB",
        } as UploadRecipeCompleteResponse,
        { status: 400 },
      )
    }

    await ensureDirectories()

    const timestamp = Date.now()
    const fileExtension = imageFile.name.split(".").pop() || "jpg"
    const fileName = `recipe-${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const localFilePath = path.join(UPLOAD_DIR, fileName)

    const buffer = Buffer.from(await imageFile.arrayBuffer())
    await fs.writeFile(localFilePath, buffer)

    const imageURL = `/uploads/recipes/${fileName}`
    const imageKey = `recipes/${fileName}`
    const documentId = generateId()

    const record: FirestoreRecord = {
      id: documentId,
      name: name.trim(),
      imageURL,
      imageKey,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      ...(userId && { userId }),
      wasteSaver,
      pcoBonus,
      ...(costPerServing !== undefined && { costPerServing }),
      likes: 0,
      shareCount: 0,
      metadata: {
        originalFileName: imageFile.name,
        fileSize: imageFile.size,
        contentType: imageFile.type,
        uploadTimestamp: timestamp,
        localFilePath,
      },
    }

    const existingRecords = await readRecords()
    existingRecords.push(record)
    await writeRecords(existingRecords)

    return NextResponse.json(
      {
        success: true,
        message: "Recipe uploaded successfully!",
        data: {
          documentId,
          imageURL,
          imageKey,
          name: name.trim(),
          description: description.trim(),
          localFilePath,
        },
      } as UploadRecipeCompleteResponse,
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in upload-recipe-complete API:", error)
    let errorMessage = "An internal server error occurred while uploading the recipe"
    let errorCode = "SERVER_ERROR"
    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("permission")) {
        errorMessage = "Failed to save file to local storage"
        errorCode = "STORAGE_ERROR"
      } else if (error.message.includes("JSON") || error.message.includes("parse")) {
        errorMessage = "Failed to save recipe data to local database"
        errorCode = "DATABASE_ERROR"
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: errorCode,
        message: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      } as UploadRecipeCompleteResponse,
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
