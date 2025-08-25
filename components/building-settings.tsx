"use client"

import { useState, useRef } from "react"
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

  const [mainImagePreview, setMainImagePreview] = useState(buildingData.url_imagen_principal || "")
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [secondaryImagePreviews, setSecondaryImagePreviews] = useState<string[]>(buildingData.imagenes_secundarias || [])
  const [secondaryImageFiles, setSecondaryImageFiles] = useState<File[]>([])
  const [isMainDragActive, setIsMainDragActive] = useState(false)
  const [isSecondaryDragActive, setIsSecondaryDragActive] = useState(false)
  const mainDropRef = useRef<HTMLDivElement>(null)
  const secondaryDropRef = useRef<HTMLDivElement>(null)

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

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const files = event.target.files
    if (files && files[0]) {
      setMainImageFile(files[0])
      setMainImagePreview(URL.createObjectURL(files[0]))
      setHasChanges(true)
    }
  }
  const handleRemoveMainImage = () => {
    setMainImageFile(null)
    setMainImagePreview("")
    setHasChanges(true)
  }
  const handleSecondaryImageUpload = (event: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      setSecondaryImageFiles((prev) => [...prev, ...newFiles])
      setSecondaryImagePreviews((prev) => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
      setHasChanges(true)
    }
  }
  const handleRemoveSecondaryImage = (index: number) => {
    setSecondaryImageFiles((prev) => prev.filter((_, i) => i !== index))
    setSecondaryImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }
  const handleMainDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsMainDragActive(false)
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleMainImageUpload({ target: { files: event.dataTransfer.files } })
    }
  }
  const handleMainDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsMainDragActive(true)
  }
  const handleMainDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsMainDragActive(false)
  }
  const handleSecondaryDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsSecondaryDragActive(false)
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleSecondaryImageUpload({ target: { files: event.dataTransfer.files } })
    }
  }
  const handleSecondaryDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsSecondaryDragActive(true)
  }
  const handleSecondaryDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsSecondaryDragActive(false)
  }

  // Agregar función para subir imágenes igual que en create-building-dialog
  const uploadImages = async (buildingPermalink: string) => {
    const images: { main?: string; secondary: string[] } = { secondary: [] }
    try {
      // Subir imagen principal si hay nueva
      if (mainImageFile) {
        const mainFormData = new FormData()
        mainFormData.append('image', mainImageFile)
        mainFormData.append('path', `edificios/${buildingPermalink}/principal.jpg`)
        const mainResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: mainFormData,
        })
        if (mainResponse.ok) {
          const mainData = await mainResponse.json()
          images.main = mainData.url
        }
      } else if (mainImagePreview) {
        images.main = mainImagePreview
      } else {
        images.main = ''
      }
      // Subir imágenes secundarias nuevas
      for (let i = 0; i < secondaryImageFiles.length; i++) {
        const formData = new FormData()
        formData.append('image', secondaryImageFiles[i])
        formData.append('path', `edificios/${buildingPermalink}/secundaria_${Date.now()}_${i + 1}.jpg`)
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const data = await response.json()
          images.secondary.push(data.url)
        }
      }
      // Mantener las imágenes secundarias existentes
      if (secondaryImagePreviews.length > secondaryImageFiles.length) {
        // Solo las que no son previews de archivos nuevos
        const existing = secondaryImagePreviews.slice(0, secondaryImagePreviews.length - secondaryImageFiles.length)
        images.secondary = [...existing, ...images.secondary]
      }
      return images
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    }
  }

  // Modificar handleSave para subir imágenes antes de guardar
  const handleSave = async () => {
    if (!user) {
      toast.error("No estás autenticado")
      return
    }
    setIsSaving(true)
    try {
      let images = {
        main: mainImagePreview,
        secondary: secondaryImagePreviews
      }
      // Subir imágenes nuevas si hay
      if (mainImageFile || secondaryImageFiles.length > 0) {
        images = await uploadImages(buildingData.permalink)
      }
      const response = await fetch(`/api/buildings/by-id/${building.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...buildingData,
          url_imagen_principal: images.main,
          imagenes_secundarias: images.secondary,
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

        {/* Imágenes del Edificio */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del Edificio</CardTitle>
            <CardDescription>Gestiona la imagen principal y las imágenes secundarias del edificio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imagen principal */}
            <div>
              <Label htmlFor="main-image">Imagen Principal</Label>
              {mainImagePreview ? (
                <div className="mt-4 flex justify-center relative group">
                  <img src={mainImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveMainImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  ref={mainDropRef}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isMainDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                  onDrop={handleMainDrop}
                  onDragOver={handleMainDragOver}
                  onDragLeave={handleMainDragLeave}
                >
                  <Settings className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Arrastra la imagen principal aquí o</p>
                  <Label htmlFor="main-image" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>Seleccionar imagen principal</span>
                    </Button>
                  </Label>
                  <Input
                    id="main-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageUpload}
                  />
                </div>
              )}
            </div>
            {/* Imágenes secundarias */}
            <div>
              <Label htmlFor="secondary-images">Imágenes Secundarias</Label>
              {secondaryImagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {secondaryImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => handleRemoveSecondaryImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div
                ref={secondaryDropRef}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mt-4 ${isSecondaryDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                onDrop={handleSecondaryDrop}
                onDragOver={handleSecondaryDragOver}
                onDragLeave={handleSecondaryDragLeave}
              >
                <Settings className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o</p>
                <Label htmlFor="secondary-images" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Seleccionar imágenes</span>
                  </Button>
                </Label>
                <Input
                  id="secondary-images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleSecondaryImageUpload}
                />
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
