"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

export default function MigrationPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const isMainAdmin = user?.email === 'homestate.dev@gmail.com'

  const executeMigration = async () => {
    if (!isMainAdmin) {
      toast({
        title: 'Acceso denegado',
        description: 'Solo el administrador principal puede ejecutar migraciones',
        variant: 'destructive'
      })
      return
    }

    if (!confirm('¿Está seguro que desea ejecutar la migración de unificación? Esta operación no se puede deshacer.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/migrate-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentUserEmail: user?.email
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMigrationResult(data)
        toast({
          title: 'Migración exitosa',
          description: 'La unificación de administradores y agentes se completó correctamente'
        })
      } else {
        toast({
          title: 'Error en migración',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error en migración:', error)
      toast({
        title: 'Error',
        description: 'Error al ejecutar la migración',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMainAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Panel de Migración
          </CardTitle>
          <CardDescription>
            Solo el administrador principal puede acceder a este panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Acceso restringido al administrador principal (homestate.dev@gmail.com)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migración: Unificación Administradores-Agentes
        </CardTitle>
        <CardDescription>
          Unifica la gestión de administradores y agentes inmobiliarios en una sola tabla
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>¡Importante!</strong> Esta migración:
            <ul className="list-disc list-inside mt-2">
              <li>Añade campos de agente inmobiliario a la tabla administradores</li>
              <li>Migra datos existentes de agentes_inmobiliarios</li>
              <li>Actualiza todas las referencias en la base de datos</li>
              <li>Los administradores serán también agentes inmobiliarios (excepto el principal)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {migrationResult ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Migración completada exitosamente:</strong>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={migrationResult.data.table_structure_updated ? "default" : "secondary"}>
                    Estructura de tabla: {migrationResult.data.table_structure_updated ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={migrationResult.data.data_migrated ? "default" : "secondary"}>
                    Datos migrados: {migrationResult.data.data_migrated ? "✓" : "No había datos"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={migrationResult.data.indexes_created ? "default" : "secondary"}>
                    Índices creados: {migrationResult.data.indexes_created ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={migrationResult.data.triggers_created ? "default" : "secondary"}>
                    Triggers creados: {migrationResult.data.triggers_created ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              La migración unificará la gestión de administradores y agentes inmobiliarios.
              Después de la migración, todos los administradores (excepto el principal) 
              actuarán también como agentes inmobiliarios.
            </p>
            <Button 
              onClick={executeMigration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ejecutando migración...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Ejecutar Migración
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 