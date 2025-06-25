"use client"

import { useState, useEffect } from "react"
import { Activity, Calendar, User, FileText, Trash2, UserPlus, Edit, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface AdminAction {
  id: number
  admin_firebase_uid: string
  accion: string
  tipo: string
  metadata: any
  fecha: string
}

export function MyActivities() {
  const [activities, setActivities] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)
  const { user, adminData } = useAuth()

  useEffect(() => {
    if (user && adminData) {
      fetchMyActivities()
    }
  }, [user, adminData])

  const fetchMyActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admins/${user?.uid}/actions`)
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.data)
      } else {
        toast.error('Error al cargar actividades')
      }
    } catch (error) {
      console.error('Error al obtener actividades:', error)
      toast.error('Error al cargar actividades')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (tipo: string) => {
    switch (tipo) {
      case 'creación':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'actualización':
      case 'edición':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'eliminación':
        return <Trash2 className="h-4 w-4 text-red-600" />
      case 'visualización':
        return <Eye className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4 text-orange-600" />
    }
  }

  const getActionColor = (tipo: string) => {
    switch (tipo) {
      case 'creación':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'actualización':
      case 'edición':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'eliminación':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'visualización':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return `Hoy a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 2) {
      return `Ayer a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getActivityStats = () => {
    const total = activities.length
    const byType = activities.reduce((acc, activity) => {
      acc[activity.tipo] = (acc[activity.tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, byType }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-orange-600" />
          <h3 className="text-2xl font-bold text-gray-900">Mis Actividades</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Cargando actividades...</p>
        </div>
      </div>
    )
  }

  const stats = getActivityStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-600" />
            <h3 className="text-2xl font-bold text-gray-900">Mis Actividades</h3>
          </div>
          <p className="text-gray-600 mt-1">Historial completo de todas tus acciones en el sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{adminData?.nombre}</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Actividades</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Creaciones</p>
                <p className="text-2xl font-bold">{stats.byType.creación || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Actualizaciones</p>
                <p className="text-2xl font-bold">{(stats.byType.actualización || 0) + (stats.byType.edición || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Eliminaciones</p>
                <p className="text-2xl font-bold">{stats.byType.eliminación || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de actividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial Detallado
          </CardTitle>
          <CardDescription>
            Todas tus actividades ordenadas por fecha más reciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay actividades registradas</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(activity.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {activity.accion}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs ${getActionColor(activity.tipo)}`}>
                                {activity.tipo}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(activity.fecha)}
                              </span>
                            </div>
                            {activity.metadata && (
                              <div className="text-xs text-gray-600 bg-gray-100 rounded p-2 mt-2">
                                <pre className="whitespace-pre-wrap font-mono">
                                  {JSON.stringify(activity.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < activities.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 