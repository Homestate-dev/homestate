"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

interface AdminData {
  firebase_uid: string
  nombre: string
  email: string
  activo: boolean
  fecha_creacion: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  adminData: AdminData | null
  login: (user: User) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  isInactive: boolean
  inactiveMessage: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInactive, setIsInactive] = useState(false)
  const [inactiveMessage, setInactiveMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar estado del usuario en la base de datos
        const isActive = await verifyUserStatus(user)
        if (isActive) {
          setUser(user)
          setIsAuthenticated(true)
          setIsInactive(false)
        } else {
          // Usuario inactivo, cerrar sesión de Firebase
          await signOut(auth)
          setUser(null)
          setIsAuthenticated(false)
          setIsInactive(true)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsInactive(false)
        setAdminData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const verifyUserStatus = async (user: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email
        })
      })

      const data = await response.json()

      if (data.success) {
        setAdminData(data.adminData)
        return true
      } else if (data.error === 'inactive_user') {
        setInactiveMessage(data.message)
        toast.error('Cuenta Inactiva', {
          description: data.message,
          duration: 8000
        })
        return false
      } else {
        console.error('Error verificando estado:', data.error)
        toast.error('Error de autenticación', {
          description: 'No tienes permisos para acceder al sistema'
        })
        return false
      }
    } catch (error) {
      console.error('Error verificando estado del usuario:', error)
      toast.error('Error de conexión')
      return false
    }
  }

  const login = async (user: User): Promise<boolean> => {
    const isActive = await verifyUserStatus(user)
    if (isActive) {
      setUser(user)
      setIsAuthenticated(true)
      setIsInactive(false)
      return true
    } else {
      setIsInactive(true)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setIsAuthenticated(false)
      setIsInactive(false)
      setAdminData(null)
      setInactiveMessage('')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      adminData,
      login, 
      logout, 
      loading,
      isInactive,
      inactiveMessage
    }}>
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