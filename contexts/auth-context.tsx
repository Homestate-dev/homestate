"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = (user: User) => {
    setUser(user)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 