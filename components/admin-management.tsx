"use client"

import { useState } from "react"
import { Users, UserPlus, Clock, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateAdminDialog } from "./create-admin-dialog"
import { AdminActivityDialog } from "./admin-activity-dialog"

// Datos de ejemplo para administradores
const adminsMock = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan.perez@homestate.com",
    activo: true,
    ultima_accion: "2025-06-01T14:30:00",
    acciones_totales: 145,
  },
  {
    id: 2,
    nombre: "María González",
    email: "maria.gonzalez@homestate.com",
    activo: true,
    ultima_accion: "2025-06-02T09:15:00",
    acciones_totales: 87,
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    email: "carlos.rodriguez@homestate.com",
    activo: false,
    ultima_accion: "2025-05-28T16:45:00",
    acciones_totales: 56,
  },
]

type AdminManagementProps = {
  buildingId?: number
}

export function AdminManagement({ buildingId }: AdminManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [admins, setAdmins] = useState(adminsMock)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateAdmin = (adminData: any) => {
    // Aquí iría la lógica para crear un administrador en la base de datos
    const newAdmin = {
      id: admins.length + 1,
      ...adminData,
      activo: true,
      ultima_accion: new Date().toISOString(),
      acciones_totales: 0,
    }
    setAdmins([...admins, newAdmin])
    setIsCreateDialogOpen(false)
  }

  const handleEditAdmin = (adminId: number) => {
    const admin = admins.find((a) => a.id === adminId)
    setSelectedAdmin(admin)
    setIsCreateDialogOpen(true)
  }

  const handleUpdateAdmin = (adminData: any) => {
    // Aquí iría la lógica para actualizar un administrador en la base de datos
    const updatedAdmins = admins.map((admin) => (admin.id === adminData.id ? { ...admin, ...adminData } : admin))
    setAdmins(updatedAdmins)
    setIsCreateDialogOpen(false)
    setSelectedAdmin(null)
  }

  const handleToggleStatus = (adminId: number) => {
    // Aquí iría la lógica para activar/desactivar un administrador en la base de datos
    const updatedAdmins = admins.map((admin) => (admin.id === adminId ? { ...admin, activo: !admin.activo } : admin))
    setAdmins(updatedAdmins)
  }

  const handleDeleteAdmin = (adminId: number) => {
    // Aquí iría la lógica para eliminar un administrador de la base de datos
    if (confirm("¿Está seguro que desea eliminar este administrador?")) {
      const updatedAdmins = admins.filter((admin) => admin.id !== adminId)
      setAdmins(updatedAdmins)
    }
  }

  const handleViewActivity = (adminId: number) => {
    const admin = admins.find((a) => a.id === adminId)
    setSelectedAdmin(admin)
    setIsActivityDialogOpen(true)
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-600" />
            Gestión de Administradores
          </h2>
          <p className="text-gray-600">Administre los usuarios con acceso global al sistema</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Administrador
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Administradores</CardTitle>
          <CardDescription>Lista de administradores con acceso al sistema</CardDescription>
          <div className="mt-2 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead>Acciones</TableHead>
                <TableHead className="text-right">Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No se encontraron administradores
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.nombre}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={admin.activo ? "default" : "destructive"}
                        className={admin.activo ? "bg-green-100 text-green-800 border-green-200" : ""}
                      >
                        {admin.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(admin.ultima_accion)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-600"
                        onClick={() => handleViewActivity(admin.id)}
                      >
                        Ver {admin.acciones_totales} acciones
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditAdmin(admin.id)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleStatus(admin.id)}
                        >
                          {admin.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{admin.activo ? "Desactivar" : "Activar"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateAdminDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={selectedAdmin ? handleUpdateAdmin : handleCreateAdmin}
        admin={selectedAdmin}
      />

      <AdminActivityDialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen} admin={selectedAdmin} />
    </div>
  )
}
