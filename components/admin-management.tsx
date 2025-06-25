"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Clock, Search, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateAdminDialog } from "./create-admin-dialog"
import { AdminActivityDialog } from "./admin-activity-dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface Admin {
  id: number
  firebase_uid: string
  nombre: string
  email: string
  activo: boolean
  fecha_creacion: string
  fecha_actualizacion: string
  acciones_totales: number
  ultima_accion: string | null
}

type AdminManagementProps = {
  buildingId?: number
}

export function AdminManagement({ buildingId }: AdminManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const isMainAdmin = user?.email === 'homestate.dev@gmail.com'

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admins')
      const data = await response.json()
      
      if (data.success) {
        setAdmins(data.data)
      } else {
        toast.error('Error al cargar administradores')
      }
    } catch (error) {
      console.error('Error al obtener administradores:', error)
      toast.error('Error al cargar administradores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (adminData: any) => {
    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adminData,
          currentUserUid: user?.uid
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Administrador creado exitosamente')
        await fetchAdmins() // Recargar la lista
        setIsCreateDialogOpen(false)
      } else {
        toast.error(data.error || 'Error al crear administrador')
      }
    } catch (error) {
      console.error('Error al crear administrador:', error)
      toast.error('Error al crear administrador')
    }
  }

  const handleEditAdmin = (adminId: string) => {
    const admin = admins.find((a) => a.firebase_uid === adminId)
    if (admin) {
      setSelectedAdmin(admin)
      setIsCreateDialogOpen(true)
    }
  }

  const handleUpdateAdmin = async (adminData: any) => {
    if (!selectedAdmin) return

    try {
      const response = await fetch(`/api/admins/${selectedAdmin.firebase_uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adminData,
          currentUserEmail: user?.email,
          currentUserUid: user?.uid
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Administrador actualizado exitosamente')
        await fetchAdmins() // Recargar la lista
        setIsCreateDialogOpen(false)
        setSelectedAdmin(null)
      } else {
        toast.error(data.error || 'Error al actualizar administrador')
      }
    } catch (error) {
      console.error('Error al actualizar administrador:', error)
      toast.error('Error al actualizar administrador')
    }
  }

  const handleToggleStatus = async (adminUid: string) => {
    const admin = admins.find((a) => a.firebase_uid === adminUid)
    if (!admin) return

    // No permitir que el administrador se modifique a sí mismo
    if (user?.uid === adminUid) {
      toast.error('No puedes modificar tu propio estado')
      return
    }

    // homestate.dev@gmail.com siempre debe estar activo
    if (admin.email === 'homestate.dev@gmail.com') {
      toast.error('El administrador principal siempre debe estar activo')
      return
    }

    if (!isMainAdmin) {
      toast.error('Solo el administrador principal puede activar/desactivar usuarios')
      return
    }

    try {
      const response = await fetch(`/api/admins/${adminUid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activo: !admin.activo,
          currentUserEmail: user?.email,
          currentUserUid: user?.uid
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Administrador ${!admin.activo ? 'activado' : 'desactivado'} exitosamente`)
        await fetchAdmins() // Recargar la lista
      } else {
        toast.error(data.error || 'Error al cambiar estado del administrador')
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado del administrador')
    }
  }

  const handleDeleteAdmin = async (adminUid: string) => {
    if (!isMainAdmin) {
      toast.error('Solo el administrador principal puede eliminar usuarios')
      return
    }

    const admin = admins.find((a) => a.firebase_uid === adminUid)
    if (!admin) return

    if (!confirm(`¿Está seguro que desea eliminar a ${admin.nombre}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admins/${adminUid}?currentUserEmail=${user?.email}&currentUserUid=${user?.uid}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Administrador eliminado exitosamente')
        await fetchAdmins() // Recargar la lista
      } else {
        toast.error(data.error || 'Error al eliminar administrador')
      }
    } catch (error) {
      console.error('Error al eliminar administrador:', error)
      toast.error('Error al eliminar administrador')
    }
  }

  const handleViewActivity = async (adminUid: string) => {
    const admin = admins.find((a) => a.firebase_uid === adminUid)
    if (admin) {
      setSelectedAdmin(admin)
      setIsActivityDialogOpen(true)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin actividad'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Cargando administradores...</span>
      </div>
    )
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
          {!isMainAdmin && (
            <p className="text-sm text-amber-600 mt-1">
              * Solo homestate.dev@gmail.com puede activar/desactivar/eliminar administradores
            </p>
          )}
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
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
                  <TableRow key={admin.firebase_uid}>
                    <TableCell className="font-medium">{admin.nombre}</TableCell>
                    <TableCell>
                      {admin.email}
                      {admin.email === 'homestate.dev@gmail.com' && (
                        <Badge variant="secondary" className="ml-2 text-xs">Principal</Badge>
                      )}
                    </TableCell>
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
                        onClick={() => handleViewActivity(admin.firebase_uid)}
                      >
                        Ver {admin.acciones_totales || 0} acciones
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditAdmin(admin.firebase_uid)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleStatus(admin.firebase_uid)}
                          disabled={!isMainAdmin || admin.email === 'homestate.dev@gmail.com'}
                        >
                          {admin.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{admin.activo ? "Desactivar" : "Activar"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDeleteAdmin(admin.firebase_uid)}
                          disabled={!isMainAdmin || admin.email === 'homestate.dev@gmail.com'}
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

      <AdminActivityDialog 
        open={isActivityDialogOpen} 
        onOpenChange={setIsActivityDialogOpen} 
        admin={selectedAdmin} 
      />
    </div>
  )
} 