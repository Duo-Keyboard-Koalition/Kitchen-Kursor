// User-related types and interfaces

export interface UserProfile {
  uid: string
  email: string | null
  firstName?: string
  lastName?: string
  displayName?: string
  photoURL?: string
  photoPath?: string
  createdAt?: string
  updatedAt?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  dietaryRestrictions?: string[]
  favoriteCategories?: string[]
  notifications?: NotificationSettings
  privacy?: PrivacySettings
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  recipeUpdates: boolean
  communityActivity: boolean
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends"
  showEmail: boolean
  showRecipeStats: boolean
}

// Authentication related types
export interface SignUpRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
  message?: string
}
