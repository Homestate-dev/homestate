"use client"

import { Clock, Search, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Datos de ejemplo para el historial de actividades
const actividadesMock = [
  {
    id: 1,
    accion: "Creó un nuevo edificio: Torre del Sol",
    fecha: "2025-06-02T09:15:00",
    tipo: "creación",
  },
  {
    id: 2,
    accion: "Editó información del edificio: Edificio Mirador",
    fecha: "2025-06-01T16:30:00",
    tipo: "edición",
  },
  {
    id: 3,
    accion: "Agregó un nuevo departamento: 301 en Edificio Mirador",
    fecha: "2025-06-01T14:45:00",
    tipo: "creación",
  },
  {
    id: 4,
    accion: "Generó código QR para: Torre del Sol",
    fecha: "2025-06-01T11:20:00",
    tipo: "generación",
  },
  {
    id: 5,
    accion: "Cambió estado de departamento 102 a: No disponible",
    fecha: "2025-05-31T10:05:00",
    tipo: "edición",
  },
  {
    id: 6,
    accion: "Eliminó departamento: 203 de Torre del Sol",
    fecha: "2025-05-30T15:40:00",
    tipo: "eliminación",
  },
  {
    id: 7,
    accion: "Generó reporte de ocupación para: Edificio Mirador",
    fecha: "2025-05-30T09:25:00",
    tipo: "reporte",
  },
  {
    id: 8,
    accion: "Inició sesión en el sistema",
    fecha: "2025-05-30T08:50:00",
    tipo: "sesión",
  },
]

type AdminActivityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: any
}

export function AdminActivityDialog({ open, onOpenChange, admin }: AdminActivityDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("todos")

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

  const filteredActivities = actividadesMock.filter(
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
                {filteredActivities.length === 0 ? (
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
