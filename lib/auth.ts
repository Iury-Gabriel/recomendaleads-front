// Auth helper functions - Client-side auth state management
// TODO: Integrate with real authentication system

import type { User } from "@/types"

const AUTH_STORAGE_KEY = "agentesia_auth"
const USER_STORAGE_KEY = "agentesia_user"

export const authHelpers = {
  setAuth: (user: User, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, "true")
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      localStorage.setItem("agentesia_token", token)
    }
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem("agentesia_token")
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTH_STORAGE_KEY) === "true" && !!localStorage.getItem("agentesia_token")
    }
    return false
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(USER_STORAGE_KEY)
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agentesia_token")
    }
    return null
  },
}
