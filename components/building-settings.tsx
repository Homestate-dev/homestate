"use client"

import { useState } from "react"
import { Settings, Save, Trash2, AlertTriangle, Loader2, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { DeleteBuildingDialog } from "@/components/delete-building-dialog"
import { TagSelector } from './tag-selector'

interface Building {
  id: number
  nombre: string
  direccion: string
  permalink: string
  costo_expensas?: number
  areas_comunales: string[]
  seguridad: string[]
  aparcamiento: string[]
  politica_mascotas?: string
  tipo_estacionamiento?: string
  descripcion?: string
  url_imagen_principal?: string
  imagenes_secundarias?: string[]
}

interface BuildingSettingsProps {
  building: Building
  onBuildingDeleted?: () => void
}

export function BuildingSettings({ building, onBuildingDeleted }: BuildingSettingsProps) {
  const [buildingData, setBuildingData] = useState(building)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { user } = useAuth()

  // Opciones predefinidas
  const areasComunalesDisponibles = [
    "Piscina climatizada",
    "Gimnasio equipado", 
    "Salón de eventos",
    "Terraza con barbacoa",
    "Área de juegos infantiles",
    "Sala de coworking",
    "Lavandería común",
    "Jardín",
    "Roof garden",
    "Sala de cine",
    "Spa",
    "Cancha de tenis"
  ]

  const seguridadDisponible = [
    "24/7 con guardia de seguridad",
    "Cámaras de seguridad",
    "Acceso controlado", 
    "Intercomunicador",
    "Sistema de alarma",
    "Vigilancia nocturna",
    "Control de acceso por tarjeta"
  ]

  const aparcamientoDisponible = [
    "Subterráneo cubierto",
    "Cochera cubierta",
    "Cochera descubierta", 
    "Espacios para visitantes",
    "Acceso automático",
    "Vigilancia 24/7",
    "Carga para autos eléctricos"
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setBuildingData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleArrayAdd = (field: string, value: string) => {
    if (!value.trim()) return
    
    setBuildingData((prev) => ({
      ...prev,
      [field]: [...prev[field as keyof Building] as string[], value.trim()]
    }))
    setHasChanges(true)
    
    // Limpiar el input correspondiente

  }

  const handleArrayRemove = (field: string, index: number) => {
    setBuildingData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof Building] as string[]).filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!user) {
      toast.error("No estás autenticado")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/buildings/by-id/${building.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...buildingData,
          currentUserUid: user.uid
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar los cambios')
      }

      setHasChanges(false)
      toast.success("Cambios guardados exitosamente", {
        description: `Los datos de ${building.nombre} han sido actualizados.`
      })

    } catch (error: any) {
      console.error('Error al guardar:', error)
      toast.error("Error al guardar", {
        description: error.message || "No se pudieron guardar los cambios"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBuildingDeleted = () => {
    toast.success("Edificio eliminado", {
      description: `El edificio "${building.nombre}" ha sido eliminado exitosamente.`
    })
    onBuildingDeleted?.()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Edificio</h2>
          <p className="text-gray-600">Edita la información y configuración del edificio</p>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            className="bg-orange-600 hover:bg-orange-700"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del edificio</Label>
              <Input
                id="nombre"
                value={buildingData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: Edificio Torres del Sol"
              />
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={buildingData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Ej: Av. Principal 123, Ciudad"
              />
            </div>

            <div>
              <Label htmlFor="permalink">Permalink (URL)</Label>
              <Input
                id="permalink"
                value={buildingData.permalink}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ URL: homestate-17ca5a8016cd.herokuapp.com/edificio/{buildingData.permalink} 
                <br/>
                <strong>El permalink no es editable por seguridad</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={buildingData.descripcion || ""}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                placeholder="Describe las características principales del edificio..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="costo_expensas">Costo de expensas por m² (mensual)</Label>
              <Input
                id="costo_expensas"
                type="number"
                step="0.01"
                value={buildingData.costo_expensas === 0 ? '' : buildingData.costo_expensas || ''}
                onChange={(e) => handleInputChange("costo_expensas", e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ej: 15.50"
              />
            </div>

            <div>
              <Label htmlFor="politica_mascotas">Política de mascotas</Label>
              <Input
                id="politica_mascotas"
                value={buildingData.politica_mascotas || ""}
                onChange={(e) => handleInputChange("politica_mascotas", e.target.value)}
                placeholder="Ej: Se permiten mascotas pequeñas"
              />
            </div>
          </CardContent>
        </Card>

        {/* Servicios y amenidades */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios y Amenidades</CardTitle>
            <CardDescription>Gestiona las áreas comunales, seguridad y estacionamiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Áreas Comunales */}
            <TagSelector
              label="Áreas Comunales"
              placeholder="Seleccionar área comunal..."
              selectedItems={buildingData.areas_comunales}
              availableItems={areasComunalesDisponibles}
              onItemsChange={(items) => setBuildingData(prev => ({ ...prev, areas_comunales: items }))}
            />

            <Separator />

            {/* Seguridad */}
            <TagSelector
              label="Seguridad"
              placeholder="Seleccionar tipo de seguridad..."
              selectedItems={buildingData.seguridad}
              availableItems={seguridadDisponible}
              onItemsChange={(items) => setBuildingData(prev => ({ ...prev, seguridad: items }))}
            />

            <Separator />

            {/* Aparcamiento */}
            <TagSelector
              label="Aparcamiento"
              placeholder="Seleccionar características..."
              selectedItems={buildingData.aparcamiento}
              availableItems={aparcamientoDisponible}
              onItemsChange={(items) => setBuildingData(prev => ({ ...prev, aparcamiento: items }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Zona de peligro */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
          <CardDescription>Estas acciones son irreversibles. Procede con precaución.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Edificio
          </Button>
        </CardContent>
      </Card>

      <DeleteBuildingDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        building={building}
        onBuildingDeleted={handleBuildingDeleted}
      />
    </div>
  )
}
