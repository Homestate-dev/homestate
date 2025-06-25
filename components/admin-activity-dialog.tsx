"use client"

import { Clock, Search, Download, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface AdminAction {
  id: number
  accion: string
  fecha: string
  tipo: string
  metadata?: any
}

type AdminActivityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: any
}

export function AdminActivityDialog({ open, onOpenChange, admin }: AdminActivityDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("todos")
  const [activities, setActivities] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && admin?.firebase_uid) {
      fetchAdminActions()
    }
  }, [open, admin?.firebase_uid])

  const fetchAdminActions = async () => {
    if (!admin?.firebase_uid) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admins/${admin.firebase_uid}/actions`)
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.data)
      } else {
        console.error('Error al cargar acciones:', data.error)
      }
    } catch (error) {
      console.error('Error al obtener acciones:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!admin) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const filteredActivities = activities.filter(
    (actividad) =>
      actividad.accion.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === "todos" || actividad.tipo === filterType),
  )

  const handleExportCSV = () => {
    // Aquí iría la lógica para exportar el historial a CSV
    alert("Exportando historial a CSV...")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Historial de Actividad: {admin.nombre}
          </DialogTitle>
          <DialogDescription>Registro de todas las acciones realizadas por este administrador</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar en el historial..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="creación">Creación</SelectItem>
                  <SelectItem value="edición">Edición</SelectItem>
                  <SelectItem value="eliminación">Eliminación</SelectItem>
                  <SelectItem value="generación">Generación</SelectItem>
                  <SelectItem value="reporte">Reporte</SelectItem>
                  <SelectItem value="sesión">Sesión</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Exportar a CSV">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acción</TableHead>
                  <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Cargando actividades...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                      No se encontraron actividades
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((actividad) => (
                    <TableRow key={actividad.id}>
                      <TableCell>{actividad.accion}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(actividad.fecha)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
