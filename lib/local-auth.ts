import { pbkdf2Sync, randomBytes } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"

const USERS_FILE = path.join(process.cwd(), "data/users.json")
const SESSIONS_FILE = path.join(process.cwd(), "data/sessions.json")

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface LocalUser {
  uid: string
  email: string
  passwordHash: string
  passwordSalt: string
  firstName: string
  lastName: string
  photoURL?: string
  photoPath?: string
  createdAt: string
  updatedAt?: string
}

export interface Session {
  token: string
  uid: string
  createdAt: string
  expiresAt: string
}

async function ensureDataDir() {
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true })
}

async function readUsers(): Promise<LocalUser[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeUsers(users: LocalUser[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
}

async function readSessions(): Promise<Session[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(SESSIONS_FILE, "utf-8")
    const sessions: Session[] = JSON.parse(data)
    // Prune expired sessions on every read
    return sessions.filter((s) => new Date(s.expiresAt) > new Date())
  } catch {
    return []
  }
}

async function writeSessions(sessions: Session[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8")
}

// PBKDF2 with a per-user random salt — no third-party deps needed
function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex")
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<LocalUser> {
  const users = await readUsers()
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw Object.assign(new Error("Email already in use"), { code: "auth/email-already-in-use" })
  }
  if (password.length < 6) {
    throw Object.assign(new Error("Password too weak — minimum 6 characters"), { code: "auth/weak-password" })
  }
  const salt = randomBytes(32).toString("hex")
  const user: LocalUser = {
    uid: randomBytes(16).toString("hex"),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  await writeUsers(users)
  return user
}

export async function verifyCredentials(email: string, password: string): Promise<LocalUser> {
  const users = await readUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { code: "auth/invalid-credential" })
  }
  const hash = hashPassword(password, user.passwordSalt)
  if (hash !== user.passwordHash) {
    throw Object.assign(new Error("Invalid email or password"), { code: "auth/invalid-credential" })
  }
  return user
}

export async function createSession(uid: string): Promise<string> {
  const sessions = await readSessions()
  const token = randomBytes(32).toString("hex")
  const now = new Date()
  sessions.push({
    token,
    uid,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  })
  await writeSessions(sessions)
  return token
}

export async function getSessionUser(token: string): Promise<LocalUser | null> {
  if (!token) return null
  const sessions = await readSessions()
  const session = sessions.find((s) => s.token === token)
  if (!session) return null
  const users = await readUsers()
  return users.find((u) => u.uid === session.uid) ?? null
}

export async function deleteSession(token: string): Promise<void> {
  const sessions = await readSessions()
  await writeSessions(sessions.filter((s) => s.token !== token))
}

export async function updateUser(
  uid: string,
  updates: Partial<Omit<LocalUser, "uid" | "email" | "passwordHash" | "passwordSalt" | "createdAt">>,
): Promise<LocalUser> {
  const users = await readUsers()
  const index = users.findIndex((u) => u.uid === uid)
  if (index === -1) throw new Error("User not found")
  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() }
  await writeUsers(users)
  return users[index]
}

export async function getUserById(uid: string): Promise<LocalUser | null> {
  const users = await readUsers()
  return users.find((u) => u.uid === uid) ?? null
}

// Cookie helpers — keep cookie config in one place
export const SESSION_COOKIE = "nn_session"
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000, // seconds
}
