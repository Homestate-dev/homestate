"use client"

import { useState } from "react"
import { Settings, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Building {
  id: number
  nombre: string
  direccion: string
  permalink: string
  politica_mascotas: string
  tipo_estacionamiento: string
}

interface BuildingSettingsProps {
  building: Building
}

export function BuildingSettings({ building }: BuildingSettingsProps) {
  const [buildingData, setBuildingData] = useState(building)
  const [hasChanges, setHasChanges] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setBuildingData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    console.log("Guardando cambios:", buildingData)
    setHasChanges(false)
    // Aquí iría la lógica para guardar
  }

  const handleDelete = () => {
    console.log("Eliminando edificio:", building.id)
    // Aquí iría la lógica para eliminar
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Edificio</h2>
          <p className="text-gray-600">Edita la información y configuración del edificio</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
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
              />
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={buildingData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="permalink">Permalink (URL)</Label>
              <Input
                id="permalink"
                value={buildingData.permalink}
                onChange={(e) => handleInputChange("permalink", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">URL: homestate.com/{buildingData.permalink}</p>
            </div>

            <div>
              <Label htmlFor="tipo_estacionamiento">Tipo de estacionamiento</Label>
              <Select
                value={buildingData.tipo_estacionamiento}
                onValueChange={(value) => handleInputChange("tipo_estacionamiento", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No tiene">No tiene</SelectItem>
                  <SelectItem value="Cochera cubierta">Cochera cubierta</SelectItem>
                  <SelectItem value="Cochera descubierta">Cochera descubierta</SelectItem>
                  <SelectItem value="Garage">Garage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="politica_mascotas">Política de mascotas</Label>
              <Input
                id="politica_mascotas"
                value={buildingData.politica_mascotas}
                onChange={(e) => handleInputChange("politica_mascotas", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuraciones avanzadas */}
        <Card>
          <CardHeader>
            <CardTitle>Configuraciones Avanzadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Visibilidad</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="visible_publico" defaultChecked />
                  <Label htmlFor="visible_publico">Visible al público</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="permitir_contacto" defaultChecked />
                  <Label htmlFor="permitir_contacto">Permitir contacto directo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mostrar_precios" defaultChecked />
                  <Label htmlFor="mostrar_precios">Mostrar precios públicamente</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold">Notificaciones</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notif_nuevos_interesados" defaultChecked />
                  <Label htmlFor="notif_nuevos_interesados">Nuevos interesados</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notif_cambios_disponibilidad" defaultChecked />
                  <Label htmlFor="notif_cambios_disponibilidad">Cambios de disponibilidad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notif_reportes_semanales" />
                  <Label htmlFor="notif_reportes_semanales">Reportes semanales</Label>
                </div>
              </div>
            </div>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Edificio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el edificio "{building.nombre}" y todos sus departamentos
                  asociados. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Sí, eliminar edificio
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
