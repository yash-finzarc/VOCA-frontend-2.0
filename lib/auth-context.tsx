"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  company: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, company: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("voca_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Auto-login with a default user for UI preview (no database connected)
      const defaultUser: User = {
        id: "demo-user-1",
        email: "demo@voca.com",
        name: "Demo User",
        company: "VOCA Demo",
        role: "admin",
      }
      setUser(defaultUser)
      localStorage.setItem("voca_user", JSON.stringify(defaultUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // For UI preview: accept any credentials (no database connected)
    const defaultUser: User = {
      id: "demo-user-1",
      email: email || "demo@voca.com",
      name: email && email.includes("@") ? email.split("@")[0] : "Demo User",
      company: "VOCA Demo",
      role: "admin",
    }
    setUser(defaultUser)
    localStorage.setItem("voca_user", JSON.stringify(defaultUser))
    return true
  }

  const signup = async (email: string, password: string, name: string, company: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("voca_users") || "[]")

    if (users.find((u: any) => u.email === email)) {
      return false
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      name,
      company,
      role: "admin",
    }

    users.push(newUser)
    localStorage.setItem("voca_users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("voca_user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("voca_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
