"use client"
import { useState, useEffect } from "react"
import { Database, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/db-status')
        const data = await response.json()
        setIsConnected(data.connected)
      } catch (error) {
        console.error('Error checking database connection:', error)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkDatabaseConnection()
    // Verificar cada 30 segundos
    const interval = setInterval(checkDatabaseConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Verificando BD...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Database className="h-4 w-4 text-gray-500" />
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={
          isConnected 
            ? "bg-green-100 text-green-800 border-green-200 animate-pulse" 
            : "bg-red-100 text-red-800 border-red-200"
        }
      >
        {isConnected ? (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Base de Datos ON
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Base de Datos OFF
          </div>
        )}
      </Badge>
    </div>
  )
} 