"use client"

import { useState } from "react"
import { Plus, MapPin, Car, Users, Eye, Edit, QrCode, Trash2, UserCog, Activity, ExternalLink, Search, Briefcase, DollarSign, Building2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CreateBuildingDialog } from "@/components/create-building-dialog"
import { DeleteBuildingDialog } from "@/components/delete-building-dialog"
import { AdminManagement } from "@/components/admin-management"
import { MyActivities } from "@/components/my-activities"

import { SalesRentalsManagement } from "@/components/sales-rentals-management"
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
  onSelectBuilding: (buildingId: number, initialTab?: string) => void
  onBuildingCreated?: () => void
  onQRClick?: (buildingId: number) => void
}

export function BuildingList({ buildings, onSelectBuilding, onBuildingCreated, onQRClick }: BuildingListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { adminData } = useAuth()
  const isMobile = useIsMobile()

  // Verificar si es el administrador principal
  const isMainAdmin = adminData?.email === 'homestate.dev@gmail.com'

  // Filtrar edificios por término de búsqueda
  const filteredBuildings = buildings.filter((building) =>
    building.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.permalink.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const generateQR = (building: Building) => {
    // Navegar directamente a la pestaña QR del edificio
    onSelectBuilding(building.id, "qr")
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
    const micrositeUrl = `https://homestate-17ca5a8016cd.herokuapp.com/edificio/${building.permalink}`
    window.open(micrositeUrl, '_blank')
    toast.success("Micrositio abierto", {
      description: `Se abrió el micrositio de ${building.nombre} en una nueva pestaña.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)} 
          className={`bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'w-full' : ''}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Edificio
        </Button>
      </div>

      <Tabs defaultValue="buildings" className="w-full">
        <TabsList className={`${isMobile ? 'grid w-full' : 'grid w-full lg:w-[1000px]'} ${isMainAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <TabsTrigger value="buildings" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
            <Building2 className="h-4 w-4" />
            {isMobile ? 'Edificios' : 'Edificios'}
          </TabsTrigger>
          <TabsTrigger value="admins" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
            <UserCog className="h-4 w-4" />
            {isMobile ? 'Agentes' : 'Agentes Inmobiliarios'}
          </TabsTrigger>
          {isMainAdmin && (
            <TabsTrigger value="sales-rentals" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
              <DollarSign className="h-4 w-4" />
              {isMobile ? 'Ventas' : 'Ventas y Arriendos'}
            </TabsTrigger>
          )}
          {isMainAdmin && (
            <TabsTrigger value="my-activities" className={`flex items-center gap-2 ${isMobile ? 'text-xs' : ''}`}>
              <Activity className="h-4 w-4" />
              {isMobile ? 'Actividad' : 'Ver mis actividades'}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="buildings" className="space-y-6">
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
            <div>
              <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>Gestión de Edificios</h3>
              <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>Administra todos tus edificios y propiedades</p>
            </div>
          </div>

          {/* Buscador de edificios */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar edificios por nombre, dirección o permalink..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

      {/* Estadísticas generales */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-4 gap-4'}`}>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <Logo size={isMobile ? 16 : 20} className="text-orange-600" />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Edificios</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{filteredBuildings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <Users className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total Depto.</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{filteredBuildings.reduce((acc, b) => acc + Number(b.departamentos_count || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <Eye className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Disponibles</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{filteredBuildings.reduce((acc, b) => acc + Number(b.disponibles_count || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <Car className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Tasa Ocup.</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  {(() => {
                    const totalDepartamentos = filteredBuildings.reduce((acc, b) => acc + Number(b.departamentos_count || 0), 0)
                    const ocupados = filteredBuildings.reduce((acc, b) => acc + (Number(b.departamentos_count || 0) - Number(b.disponibles_count || 0)), 0)
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
          {filteredBuildings.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron edificios</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Intenta con otro término de búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {filteredBuildings.map((building) => (
                <Card key={building.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`relative ${isMobile ? 'h-32' : 'h-48'} w-full`}>
                    <Image
                      src={building.url_imagen_principal || "/placeholder.svg"}
                      alt={building.nombre}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'text-xs' : ''}`}>{Number(building.disponibles_count || 0)} disponibles</Badge>
                    </div>
                  </div>

                  <CardHeader className={`${isMobile ? 'p-3 pb-2' : 'pb-2'}`}>
                    <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>{building.nombre}</CardTitle>
                    <CardDescription className={`flex items-center gap-1 ${isMobile ? 'text-xs' : ''}`}>
                      <MapPin className="h-4 w-4" />
                      {building.direccion}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className={`space-y-3 ${isMobile ? 'p-3 pt-0' : ''}`}>
                    <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-gray-600">Departamentos:</span>
                      <Badge variant="outline">{Number(building.departamentos_count || 0)}</Badge>
                    </div>

                    {building.costo_expensas > 0 && (
                      <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="text-gray-600">Expensas:</span>
                        <span className="font-medium">${building.costo_expensas}</span>
                      </div>
                    )}

                    {building.areas_comunales.length > 0 && (
                      <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="text-gray-600">Amenidades:</span>
                        <span className="font-medium text-xs">
                          {building.areas_comunales.slice(0, 2).join(', ')}
                          {building.areas_comunales.length > 2 && ` +${building.areas_comunales.length - 2}`}
                        </span>
                      </div>
                    )}

                    {building.seguridad.length > 0 && (
                      <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="text-gray-600">Seguridad:</span>
                        <span className="font-medium text-xs">
                          {building.seguridad.slice(0, 2).join(', ')}
                          {building.seguridad.length > 2 && ` +${building.seguridad.length - 2}`}
                        </span>
                      </div>
                    )}

                    {/* Mostrar permalink */}
                    <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span className="text-gray-600">Micrositio:</span>
                      <span className="font-mono text-xs text-blue-600">/{building.permalink}</span>
                    </div>

                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
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
                      <Button size="sm" variant="outline" onClick={() => generateQR(building)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onSelectBuilding(building.id, 'settings')}
                        className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                        title="Configurar edificio"
                      >
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
          )}
        </TabsContent>
        
        <TabsContent value="admins">
          <AdminManagement buildingId={0} />
        </TabsContent>

        {isMainAdmin && (
          <TabsContent value="sales-rentals">
            <SalesRentalsManagement />
          </TabsContent>
        )}

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
