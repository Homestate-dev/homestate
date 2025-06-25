"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si hay una sesión guardada en localStorage
    const savedAuth = localStorage.getItem('homestate-auth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem('homestate-auth', 'true')
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('homestate-auth')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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