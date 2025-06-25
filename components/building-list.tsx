"use client"

import { useState } from "react"
import { Plus, Building2, MapPin, Car, Users, Eye, Edit, QrCode, Trash2, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateBuildingDialog } from "@/components/create-building-dialog"
import { AdminManagement } from "@/components/admin-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

interface Building {
  id: number
  nombre: string
  direccion: string
  permalink: string
  politica_mascotas: string
  tipo_estacionamiento: string
  url_imagen_principal: string
  fecha_creacion: string
  departamentos_count: number
  disponibles_count: number
}

interface BuildingListProps {
  buildings: Building[]
  onSelectBuilding: (buildingId: number) => void
}

export function BuildingList({ buildings, onSelectBuilding }: BuildingListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const generateQR = (buildingId: number) => {
    console.log(`Generando QR para edificio ${buildingId}`)
    // Aquí iría la lógica para generar QR
  }

  const deleteBuilding = (buildingId: number) => {
    console.log(`Eliminando edificio ${buildingId}`)
    // Aquí iría la lógica para eliminar
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
          <p className="text-gray-600 mt-1">Gestiona edificios, propiedades y administradores</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Edificio
        </Button>
      </div>

      <Tabs defaultValue="buildings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="buildings" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Edificios
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Administradores
          </TabsTrigger>
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
                  {Math.round(
                    (buildings.reduce((acc, b) => acc + (b.departamentos_count - b.disponibles_count), 0) /
                      buildings.reduce((acc, b) => acc + b.departamentos_count, 0)) *
                      100,
                  )}
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

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estacionamiento:</span>
                    <span className="font-medium">{building.tipo_estacionamiento}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mascotas:</span>
                    <span className="font-medium text-xs">
                      {building.politica_mascotas.length > 20
                        ? `${building.politica_mascotas.substring(0, 20)}...`
                        : building.politica_mascotas}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      onClick={() => onSelectBuilding(building.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Gestionar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateQR(building.id)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteBuilding(building.id)}>
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
      </Tabs>

      <CreateBuildingDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
