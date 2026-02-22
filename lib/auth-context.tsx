"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types/auth"
import { useRouter } from "next/navigation"

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem("pel_token")
    const savedUser = localStorage.getItem("pel_user")
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (user: User, token: string) => {
    setUser(user)
    setToken(token)
    localStorage.setItem("pel_token", token)
    localStorage.setItem("pel_user", JSON.stringify(user))
    router.push("/dashboard")
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("pel_token")
    localStorage.removeItem("pel_user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
