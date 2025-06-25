"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface CreateBuildingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBuildingDialog({ open, onOpenChange }: CreateBuildingDialogProps) {
  const [buildingData, setBuildingData] = useState({
    nombre: "",
    direccion: "",
    permalink: "",
    politica_mascotas: "",
    tipo_estacionamiento: "",
    servicios: [] as string[],
    tipos_seguridad: [] as string[],
    expensas: [] as { descripcion: string; valor: number }[],
  })

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const serviciosDisponibles = [
    "Piscina climatizada",
    "Gimnasio equipado",
    "Salón de eventos",
    "Terraza con parrillas",
    "Área de juegos infantiles",
    "Sala de coworking",
    "Lavandería común",
    "Jardín",
    "Roof garden",
    "Sala de cine",
    "Spa",
    "Cancha de tenis",
  ]

  const tiposSeguridadDisponibles = [
    "Portero 24/7",
    "Cámaras de seguridad",
    "Acceso controlado",
    "Intercomunicador",
    "Sistema de alarma",
    "Vigilancia privada",
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
    }
  }

  const handleServicioChange = (servicio: string, checked: boolean) => {
    setBuildingData((prev) => ({
      ...prev,
      servicios: checked ? [...prev.servicios, servicio] : prev.servicios.filter((s) => s !== servicio),
    }))
  }

  const handleSeguridadChange = (seguridad: string, checked: boolean) => {
    setBuildingData((prev) => ({
      ...prev,
      tipos_seguridad: checked
        ? [...prev.tipos_seguridad, seguridad]
        : prev.tipos_seguridad.filter((s) => s !== seguridad),
    }))
  }

  const addExpensa = () => {
    setBuildingData((prev) => ({
      ...prev,
      expensas: [...prev.expensas, { descripcion: "", valor: 0 }],
    }))
  }

  const updateExpensa = (index: number, field: string, value: string | number) => {
    setBuildingData((prev) => ({
      ...prev,
      expensas: prev.expensas.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }))
  }

  const removeExpensa = (index: number) => {
    setBuildingData((prev) => ({
      ...prev,
      expensas: prev.expensas.filter((_, i) => i !== index),
    }))
  }

  const generatePermalink = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim()
  }

  const handleNombreChange = (nombre: string) => {
    setBuildingData((prev) => ({
      ...prev,
      nombre,
      permalink: generatePermalink(nombre),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Datos del edificio:", buildingData)
    console.log("Imagen:", uploadedImage)
    // Aquí iría la lógica para guardar el edificio
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            Crear Nuevo Edificio
          </DialogTitle>
          <DialogDescription>
            Complete toda la información del edificio. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del edificio *</Label>
                <Input
                  id="nombre"
                  value={buildingData.nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Edificio Mirador"
                  required
                />
              </div>
              <div>
                <Label htmlFor="permalink">Permalink (URL amigable)</Label>
                <Input
                  id="permalink"
                  value={buildingData.permalink}
                  onChange={(e) => setBuildingData((prev) => ({ ...prev, permalink: e.target.value }))}
                  placeholder="edificio-mirador"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  value={buildingData.direccion}
                  onChange={(e) => setBuildingData((prev) => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Ej: Av. Principal 123, Ciudad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo_estacionamiento">Tipo de estacionamiento *</Label>
                <Select
                  value={buildingData.tipo_estacionamiento}
                  onValueChange={(value) => setBuildingData((prev) => ({ ...prev, tipo_estacionamiento: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
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
                  onChange={(e) => setBuildingData((prev) => ({ ...prev, politica_mascotas: e.target.value }))}
                  placeholder="Ej: Se permiten mascotas pequeñas"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Imagen principal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Imagen Principal</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {uploadedImage ? (
                <div className="space-y-2">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Preview"
                    className="mx-auto h-32 w-auto rounded"
                  />
                  <p className="text-sm text-green-600">Imagen cargada correctamente</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Arrastra una imagen aquí o</p>
                </>
              )}
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>Seleccionar imagen</span>
                </Button>
              </Label>
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          <Separator />

          {/* Servicios */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Servicios y Amenidades</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {serviciosDisponibles.map((servicio) => (
                <div key={servicio} className="flex items-center space-x-2">
                  <Checkbox
                    id={servicio}
                    checked={buildingData.servicios.includes(servicio)}
                    onCheckedChange={(checked) => handleServicioChange(servicio, checked as boolean)}
                  />
                  <Label htmlFor={servicio} className="text-sm">
                    {servicio}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Seguridad */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tipos de Seguridad</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tiposSeguridadDisponibles.map((seguridad) => (
                <div key={seguridad} className="flex items-center space-x-2">
                  <Checkbox
                    id={seguridad}
                    checked={buildingData.tipos_seguridad.includes(seguridad)}
                    onCheckedChange={(checked) => handleSeguridadChange(seguridad, checked as boolean)}
                  />
                  <Label htmlFor={seguridad} className="text-sm">
                    {seguridad}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Expensas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Expensas</h3>
              <Button type="button" variant="outline" size="sm" onClick={addExpensa}>
                Agregar Expensa
              </Button>
            </div>
            <div className="space-y-3">
              {buildingData.expensas.map((expensa, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`expensa-desc-${index}`}>Descripción</Label>
                    <Input
                      id={`expensa-desc-${index}`}
                      value={expensa.descripcion}
                      onChange={(e) => updateExpensa(index, "descripcion", e.target.value)}
                      placeholder="Ej: Mantenimiento"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`expensa-valor-${index}`}>Valor (USD)</Label>
                    <Input
                      id={`expensa-valor-${index}`}
                      type="number"
                      step="0.01"
                      value={expensa.valor}
                      onChange={(e) => updateExpensa(index, "valor", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeExpensa(index)}>
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Crear Edificio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
