"use client"

import { useState, useEffect } from "react"
import { Activity, Calendar, User, FileText, Trash2, UserPlus, Edit, Eye, Download, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminAction {
  id: number
  admin_firebase_uid: string
  admin_nombre: string
  admin_email: string
  accion: string
  tipo: string
  metadata: any
  fecha: string
}

export function MyActivities() {
  const [activities, setActivities] = useState<AdminAction[]>([])
  const [filteredActivities, setFilteredActivities] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user, adminData } = useAuth()

  const isMainAdmin = user?.email === 'homestate.dev@gmail.com'

  // Paginación
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Reiniciar página cuando cambian filtros o tamaño de página
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, rowsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / rowsPerPage))

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  useEffect(() => {
    if (user && adminData) {
      fetchActivities()
    }
  }, [user, adminData])

  useEffect(() => {
    // Filtrar actividades por término de búsqueda
    const filtered = activities.filter(activity =>
      (activity.admin_nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (activity.admin_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (activity.accion?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (activity.tipo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    setFilteredActivities(filtered)
  }, [activities, searchTerm])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admins/activities')
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

  const downloadCSV = () => {
    if (filteredActivities.length === 0) {
      toast.error('No hay datos para descargar')
      return
    }

    // Crear headers del CSV
    const headers = [
      'ID',
      'Administrador',
      'Email',
      'Acción',
      'Tipo',
      'Fecha',
      'Metadata'
    ]

    // Crear filas del CSV
    const rows = filteredActivities.map(activity => [
      activity.id,
      activity.admin_nombre,
      activity.admin_email,
      `"${activity.accion.replace(/"/g, '""')}"`, // Escapar comillas
      activity.tipo,
      new Date(activity.fecha).toLocaleString('es-ES'),
      `"${JSON.stringify(activity.metadata || {}).replace(/"/g, '""')}"`
    ])

    // Combinar headers y rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `actividades_administradores_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('CSV descargado exitosamente')
    } else {
      toast.error('Su navegador no soporta descargas automáticas')
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

  if (!isMainAdmin) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Solo el administrador principal puede ver todas las actividades</p>
      </div>
    )
  }

  const stats = getActivityStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-600" />
            Actividades de Administradores
          </h2>
          <p className="text-gray-600">Historial completo de acciones realizadas por todos los administradores</p>
        </div>
        <Button 
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={filteredActivities.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Actividades</CardTitle>
          <CardDescription>
            Registro de todas las acciones realizadas en el sistema
          </CardDescription>
          
          {/* Buscador */}
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por administrador, email, acción o tipo..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Cargando actividades...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No se encontraron actividades' : 'No hay actividades registradas'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Intenta con otro término de búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Actividades</p>
                        <p className="text-2xl font-bold">{filteredActivities.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Creaciones</p>
                        <p className="text-2xl font-bold">
                          {filteredActivities.filter(a => a.tipo === 'creación').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Ediciones</p>
                        <p className="text-2xl font-bold">
                          {filteredActivities.filter(a => a.tipo === 'edición').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Eliminaciones</p>
                        <p className="text-2xl font-bold">
                          {filteredActivities.filter(a => a.tipo === 'eliminación').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de actividades */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.admin_nombre}</p>
                          <p className="text-sm text-gray-600">{activity.admin_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{activity.accion}</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            activity.tipo === 'creación' ? 'border-green-200 text-green-800' :
                            activity.tipo === 'edición' ? 'border-yellow-200 text-yellow-800' :
                            activity.tipo === 'eliminación' ? 'border-red-200 text-red-800' :
                            'border-gray-200 text-gray-800'
                          }
                        >
                          {activity.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(activity.fecha)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Controles de paginación */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
                {/* Selector de filas por página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Filas por página:</span>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => setRowsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-24 h-8 text-sm" >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5,10,25,50,100].map((size) => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Navegación de páginas */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 