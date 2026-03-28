"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface LocalAuthUser {
  uid: string
  email: string | null
  photoURL: string | null
  metadata: { creationTime: string }
  // No-op — token lives in an HTTP-only cookie, not accessible to JS
  getIdToken: () => Promise<string>
}

interface UserProfile {
  uid: string
  email: string | null
  firstName?: string
  lastName?: string
  photoURL?: string
}

interface AuthContextType {
  user: LocalAuthUser | null
  loading: boolean
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<LocalAuthUser | null>
  signIn: (email: string, password: string) => Promise<LocalAuthUser | null>
  signOut: () => Promise<void>
  userProfile: UserProfile | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function buildUser(data: any): LocalAuthUser {
  return {
    uid: data.uid,
    email: data.email,
    photoURL: data.photoURL || null,
    metadata: { creationTime: data.createdAt },
    getIdToken: async () => "",
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LocalAuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if the session cookie is valid
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(buildUser(data.user))
          setUserProfile({
            uid: data.user.uid,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            photoURL: data.user.photoURL,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<LocalAuthUser | null> => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
    const data = await res.json()
    if (!data.success) {
      throw Object.assign(new Error(data.message), { code: data.error })
    }
    const authUser = buildUser(data.user)
    setUser(authUser)
    setUserProfile({
      uid: data.user.uid,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
    })
    return authUser
  }

  const signIn = async (email: string, password: string): Promise<LocalAuthUser | null> => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) {
      throw Object.assign(new Error(data.message), { code: data.error })
    }
    const authUser = buildUser(data.user)
    setUser(authUser)
    setUserProfile({
      uid: data.user.uid,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      photoURL: data.user.photoURL,
    })
    return authUser
  }

  const signOut = async () => {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {})
    setUser(null)
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, userProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
