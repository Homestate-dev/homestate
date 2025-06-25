"use client"

import { useState } from "react"
import { Plus, Building2, MapPin, Car, Users, Eye, Edit, QrCode, Trash2, UserCog, Activity, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateBuildingDialog } from "@/components/create-building-dialog"
import { DeleteBuildingDialog } from "@/components/delete-building-dialog"
import { AdminManagement } from "@/components/admin-management"
import { MyActivities } from "@/components/my-activities"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

interface Building {
  id: number
  nombre: string
  direccion: string
  permalink: string
  costo_expensas: number
  areas_comunales: string[]
  seguridad: string[]
  aparcamiento: string[]
  url_imagen_principal: string
  imagenes_secundarias: string[]
  fecha_creacion: string
  departamentos_count: number
  disponibles_count: number
}

interface BuildingListProps {
  buildings: Building[]
  onSelectBuilding: (buildingId: number) => void
  onBuildingCreated?: () => void
}

export function BuildingList({ buildings, onSelectBuilding, onBuildingCreated }: BuildingListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null)
  const { adminData } = useAuth()

  // Verificar si es el administrador principal
  const isMainAdmin = adminData?.email === 'homestate.dev@gmail.com'

  const generateQR = (buildingId: number) => {
    console.log(`Generando QR para edificio ${buildingId}`)
    // Aquí iría la lógica para generar QR
  }

  const handleDeleteClick = (building: Building) => {
    setBuildingToDelete(building)
    setShowDeleteDialog(true)
  }

  const handleBuildingDeleted = () => {
    toast.success("Edificio eliminado", {
      description: `El edificio "${buildingToDelete?.nombre}" ha sido eliminado exitosamente.`,
    })
    setBuildingToDelete(null)
    onBuildingCreated?.() // Recargar la lista
  }

  const handleDeleteDialogClose = () => {
    setShowDeleteDialog(false)
    setBuildingToDelete(null)
  }

  const handleVisitMicrosite = (building: Building) => {
    const micrositeUrl = `https://homestate-17ca5a8016cd.herokuapp.com/${building.permalink}`
    window.open(micrositeUrl, '_blank')
    toast.success("Micrositio abierto", {
      description: `Se abrió el micrositio de ${building.nombre} en una nueva pestaña.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Edificio
        </Button>
      </div>

      <Tabs defaultValue="buildings" className="w-full">
        <TabsList className={`grid w-full ${isMainAdmin ? 'grid-cols-3' : 'grid-cols-2'} lg:w-[600px]`}>
          <TabsTrigger value="buildings" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Edificios
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Administradores
          </TabsTrigger>
          {isMainAdmin && (
            <TabsTrigger value="my-activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Ver mis actividades
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="buildings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Gestión de Edificios</h3>
              <p className="text-gray-600 mt-1">Administra todos tus edificios y propiedades</p>
            </div>
          </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Edificios</p>
                <p className="text-2xl font-bold">{buildings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Departamentos</p>
                <p className="text-2xl font-bold">{buildings.reduce((acc, b) => acc + b.departamentos_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold">{buildings.reduce((acc, b) => acc + b.disponibles_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Tasa Ocupación</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const totalDepartamentos = buildings.reduce((acc, b) => acc + b.departamentos_count, 0)
                    const ocupados = buildings.reduce((acc, b) => acc + (b.departamentos_count - b.disponibles_count), 0)
                    return totalDepartamentos > 0 ? Math.round((ocupados / totalDepartamentos) * 100) : 0
                  })()}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Lista de edificios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <Card key={building.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={building.url_imagen_principal || "/placeholder.svg"}
                    alt={building.nombre}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-600 hover:bg-orange-700">{building.disponibles_count} disponibles</Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{building.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {building.direccion}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Departamentos:</span>
                    <Badge variant="outline">{building.departamentos_count}</Badge>
                  </div>

                  {building.costo_expensas > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expensas:</span>
                      <span className="font-medium">${building.costo_expensas}</span>
                    </div>
                  )}

                  {building.areas_comunales.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amenidades:</span>
                      <span className="font-medium text-xs">
                        {building.areas_comunales.slice(0, 2).join(', ')}
                        {building.areas_comunales.length > 2 && ` +${building.areas_comunales.length - 2}`}
                      </span>
                    </div>
                  )}

                  {building.seguridad.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Seguridad:</span>
                      <span className="font-medium text-xs">
                        {building.seguridad.slice(0, 2).join(', ')}
                        {building.seguridad.length > 2 && ` +${building.seguridad.length - 2}`}
                      </span>
                    </div>
                  )}

                  {/* Mostrar permalink */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Micrositio:</span>
                    <span className="font-mono text-xs text-blue-600">/{building.permalink}</span>
                  </div>

                  <div className="flex gap-1 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      onClick={() => onSelectBuilding(building.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Gestionar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleVisitMicrosite(building)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      title={`Visitar micrositio: /${building.permalink}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateQR(building.id)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteClick(building)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="admins">
          <AdminManagement buildingId={0} />
        </TabsContent>

        {isMainAdmin && (
          <TabsContent value="my-activities">
            <MyActivities />
          </TabsContent>
        )}
      </Tabs>

      <CreateBuildingDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onBuildingCreated={onBuildingCreated}
      />

      <DeleteBuildingDialog
        open={showDeleteDialog}
        onOpenChange={handleDeleteDialogClose}
        building={buildingToDelete}
        onBuildingDeleted={handleBuildingDeleted}
      />
    </div>
  )
}
