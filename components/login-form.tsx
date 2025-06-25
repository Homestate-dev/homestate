"use client"
import { useState } from "react"
import { Building2, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useIsMobile } from "@/hooks/use-mobile"

interface LoginFormProps {
  onLoginSuccess: (user: any) => Promise<boolean>
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInactive, setIsInactive] = useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setIsInactive(false)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const loginSuccess = await onLoginSuccess(userCredential.user)
      
      if (!loginSuccess) {
        // El usuario está inactivo, se manejó en el contexto
        setIsInactive(true)
        setError("Tu cuenta está inactiva. Por favor comunícate con el administrador superior para poder recuperar la actividad en HomEstate.")
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)
      
      // Mapear errores de Firebase a mensajes en español
      let errorMessage = "Error al iniciar sesión. Por favor, intenta de nuevo."
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña."
          break
        case 'auth/invalid-email':
          errorMessage = "El formato del email no es válido."
          break
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde."
          break
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión. Verifica tu conexión a internet."
          break
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-orange-600`} />
          </div>
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
            HomEstate
          </CardTitle>
          <CardDescription className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
            Panel de Administración
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4' : ''}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant={isInactive ? "default" : "destructive"} className={isInactive ? "border-orange-200 bg-orange-50" : ""}>
                {isInactive && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                <AlertDescription className={`${isInactive ? "text-orange-800" : ""} ${isMobile ? 'text-sm' : ''}`}>
                  {error}
                  {isInactive && (
                    <div className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <p className="font-semibold">Contacta al administrador:</p>
                      <p>📧 homestate.dev@gmail.com</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full ${isMobile ? 'h-12 text-base' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pr-10 ${isMobile ? 'h-12 text-base' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isMobile ? 'touch-target' : ''}`}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'h-12 text-base touch-target' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
              Acceso restringido solo para administradores autorizados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 