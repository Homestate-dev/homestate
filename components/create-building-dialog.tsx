"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Building2, X, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { TagSelector } from './tag-selector'

interface CreateBuildingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBuildingCreated?: () => void
}

export function CreateBuildingDialog({ open, onOpenChange, onBuildingCreated }: CreateBuildingDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [buildingData, setBuildingData] = useState({
    nombre: "",
    direccion: "",
    permalink: "",
    costo_expensas: "",
    areas_comunales: [] as string[],
    seguridad: [] as string[],
    aparcamiento: [] as string[],
    descripcion: "",
  })

  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [secondaryImages, setSecondaryImages] = useState<File[]>([])
  const [secondaryImagePreviews, setSecondaryImagePreviews] = useState<string[]>([])

  const areasComunalesDisponibles = [
    "Áreas comunales",
    "Piscina climatizada",
    "Gimnasio equipado",
    "Salón de eventos",
    "Terraza con barbacoa",
    "Área de juegos infantiles",
    "Sala de coworking",
    "Lavandería común"
  ]

  const seguridadDisponible = [
    "24/7 con guardia de seguridad",
    "Cámaras de seguridad",
    "Acceso controlado",
    "Intercomunicador",
    "Sistema de alarma"
  ]

  const aparcamientoDisponible = [
    "Subterráneo cubierto",
    "45 espacios totales",
    "8 espacios para visitantes", 
    "Acceso automático",
    "Vigilancia 24/7"
  ]

  const generatePermalink = (nombre: string) => {
    let permalink = nombre
      .toLowerCase()
      .replace(/^edificio\s+/i, '') // Quitar "edificio" del inicio
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .trim()
    
    return `edificio-${permalink}`
  }

  const handleNombreChange = (nombre: string) => {
    setBuildingData((prev) => ({
      ...prev,
      nombre,
      permalink: generatePermalink(nombre),
    }))
  }

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setMainImage(file)
      const imageUrl = URL.createObjectURL(file)
      setMainImagePreview(imageUrl)
    }
  }

  const handleSecondaryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSecondaryImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const imageUrl = URL.createObjectURL(file)
      setSecondaryImagePreviews(prev => [...prev, imageUrl])
    })
  }

  const removeSecondaryImage = (index: number) => {
    setSecondaryImages(prev => prev.filter((_, i) => i !== index))
    setSecondaryImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleCheckboxChange = (category: keyof typeof buildingData, value: string, checked: boolean) => {
    setBuildingData((prev) => ({
      ...prev,
      [category]: checked 
        ? [...(prev[category] as string[]), value]
        : (prev[category] as string[]).filter((item) => item !== value),
    }))
  }

  const uploadImages = async (buildingName: string) => {
    const images: { main?: string; secondary: string[] } = { secondary: [] }
    
    try {
      // Subir imagen principal
      if (mainImage) {
        const mainFormData = new FormData()
        mainFormData.append('image', mainImage)
        mainFormData.append('path', `edificios/${buildingName}/principal.jpg`)
        
        const mainResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: mainFormData,
        })
        
        if (mainResponse.ok) {
          const mainData = await mainResponse.json()
          images.main = mainData.url
        }
      }

      // Subir imágenes secundarias
      for (let i = 0; i < secondaryImages.length; i++) {
        const formData = new FormData()
        formData.append('image', secondaryImages[i])
        formData.append('path', `edificios/${buildingName}/secundaria_${i + 1}.jpg`)
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          images.secondary.push(data.url)
        }
      }
      
      return images
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!buildingData.nombre || !buildingData.direccion) {
      toast.error('Por favor complete los campos obligatorios')
      return
    }

    // Temporalmente hacer la imagen opcional hasta que Firebase esté configurado
    // if (!mainImage) {
    //   toast.error('La imagen principal es obligatoria')
    //   return
    // }

    setLoading(true)
    
    try {
      // Temporalmente usar URL placeholder hasta que Firebase esté configurado
      let images = {
        main: mainImage ? '/placeholder.svg' : '/placeholder.svg',
        secondary: []
      }

      // Si hay imágenes, intentar subirlas (pero no fallar si no funciona)
      if (mainImage) {
        try {
          images = await uploadImages(buildingData.permalink)
        } catch (uploadError) {
          console.warn('Error uploading images, using placeholder:', uploadError)
          // Continuar con placeholder
        }
      }
      
      // Crear edificio en la base de datos
      const response = await fetch('/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...buildingData,
          url_imagen_principal: images.main,
          imagenes_secundarias: images.secondary,
          currentUserUid: user?.uid
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Edificio creado exitosamente')
    onOpenChange(false)
        onBuildingCreated?.() // Recargar lista de edificios
        // Resetear formulario
        setBuildingData({
          nombre: "",
          direccion: "",
          permalink: "",
          costo_expensas: "",
          areas_comunales: [],
          seguridad: [],
          aparcamiento: [],
          descripcion: "",
        })
        setMainImage(null)
        setMainImagePreview(null)
        setSecondaryImages([])
        setSecondaryImagePreviews([])
      } else {
        toast.error(data.error || 'Error al crear edificio')
      }
    } catch (error) {
      console.error('Error creating building:', error)
      toast.error('Error al crear edificio')
    } finally {
      setLoading(false)
    }
  }

  const [isMainDragActive, setIsMainDragActive] = useState(false)
  const [isSecondaryDragActive, setIsSecondaryDragActive] = useState(false)
  const mainDropRef = useRef<HTMLDivElement>(null)
  const secondaryDropRef = useRef<HTMLDivElement>(null)

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
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="permalink">Permalink (generado automáticamente)</Label>
                <Input
                  id="permalink"
                  value={buildingData.permalink}
                  placeholder="edificio-mirador"
                    disabled
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
                  <Label htmlFor="costo_expensas">Costo de expensas por m² (opcional)</Label>
                <Input
                    id="costo_expensas"
                    type="number"
                    step="0.01"
                    value={buildingData.costo_expensas}
                    onChange={(e) => setBuildingData((prev) => ({ ...prev, costo_expensas: e.target.value }))}
                    placeholder="Ej: 15.50"
                    min="0"
                  />
                </div>
              <div className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <textarea
                  id="descripcion"
                  value={buildingData.descripcion}
                  onChange={(e) => setBuildingData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el edificio..."
                  required
                  className="w-full min-h-[80px] border rounded p-2"
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Información del edificio */}
          <Card>
            <CardHeader>
              <CardTitle>Información del edificio</CardTitle>
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

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Imagen principal */}
              <div>
                <Label htmlFor="main-image">Imagen Principal *</Label>
                <div
                  ref={mainDropRef}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isMainDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                  onDrop={handleMainDrop}
                  onDragOver={handleMainDragOver}
                  onDragLeave={handleMainDragLeave}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
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
                    required
                  />
                  {mainImagePreview && (
                    <div className="mt-4 flex justify-center">
                      <img src={mainImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Imágenes secundarias */}
              <div>
                <Label htmlFor="secondary-images">Imágenes Secundarias (opcional)</Label>
                <div
                  ref={secondaryDropRef}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isSecondaryDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                  onDrop={handleSecondaryDrop}
                  onDragOver={handleSecondaryDragOver}
                  onDragLeave={handleSecondaryDragLeave}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
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
                  {secondaryImagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {secondaryImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeSecondaryImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Edificio'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
