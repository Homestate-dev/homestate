"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, EyeOff, Home, Maximize, Upload, X, Loader2, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import TransactionDialog from './transaction-dialog'
import { TagSelector } from './tag-selector'

interface Department {
  id: number
  edificio_id: number
  numero: string
  nombre: string
  piso: number
  area_total: number
  area_cubierta?: number
  area_descubierta?: number
  cantidad_banos?: number
  valor_arriendo?: number
  valor_venta?: number
  alicuota?: number
  incluye_alicuota?: boolean
  disponible: boolean
  cantidad_habitaciones: string
  tipo: string
  estado: string
  ideal_para: string
  ambientes_y_adicionales: string[]
  tiene_bodega?: boolean
  videos_url: string[]
  imagenes: string[]
  fecha_creacion: string
  fecha_actualizacion: string
  agente_venta_id?: number
  agente_arriendo_id?: number
  fecha_venta?: string
  fecha_arriendo?: string
  precio_venta_final?: number
  precio_arriendo_final?: number
}

interface ApartmentManagementProps {
  buildingId: number
  buildingName: string
  buildingPermalink: string
}

export function ApartmentManagement({ buildingId, buildingName, buildingPermalink }: ApartmentManagementProps) {
  const [departamentos, setDepartamentos] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [editUploadedImages, setEditUploadedImages] = useState<File[]>([])
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deletingImages, setDeletingImages] = useState<string[]>([])
  const [uploadingNewImages, setUploadingNewImages] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [agents, setAgents] = useState([])

  // Opciones predefinidas para ambientes y adicionales
  const ambientesYAdicionalesDisponibles = [
    "Living comedor",
    "Cocina separada",
    "Antebano",
    "Baño completo",
    "Aire acondicionado",
    "Placares",
    "Cocina con horno y anafe",
    "Muebles bajo mesada",
    "Desayunador de madera",
    "Amueblado",
    "Terraza",
    "Balcón",
    "Vista al mar",
    "Vista a la ciudad",
    "Closet walk-in",
    "Baño de servicio",
    "Lavandería",
    "Estudio",
    "Sala de estar",
    "Comedor independiente"
  ]

  const [newApartment, setNewApartment] = useState({
    numero: "",
    nombre: "",
    piso: "",
    area_total: "",
    area_cubierta: "",
    area_descubierta: "",
    cantidad_banos: "1",
    valor_arriendo: "",
    valor_venta: "",
    alicuota: "",
    incluye_alicuota: false,
    cantidad_habitaciones: "",
    tipo: "",
    estado: "",
    ideal_para: "",
    ambientes_y_adicionales: [] as string[],
    tiene_bodega: false,
    videos_url: [] as string[],
    descripcion: "",
  })

  // Debug: verificar que las opciones estén definidas
  console.log('ambientesYAdicionalesDisponibles:', ambientesYAdicionalesDisponibles)
  console.log('newApartment.ambientes_y_adicionales:', newApartment.ambientes_y_adicionales)

  useEffect(() => {
    fetchDepartments()
    loadAgents()
  }, [buildingId])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/departments?edificio_id=${buildingId}`)
      const data = await response.json()
      
      if (data.success) {
        setDepartamentos(data.data)
      } else {
        toast.error('Error al cargar departamentos')
      }
    } catch (error) {
      console.error('Error al obtener departamentos:', error)
      toast.error('Error al cargar departamentos')
    } finally {
      setLoading(false)
    }
  }

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/admins')
      const data = await response.json()
      if (data.success) {
        // Incluir todos los administradores (independientemente de la bandera es_agente)
        setAgents(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar agentes:', error)
    }
  }

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setCurrentImageIndex(0)
    setShowViewDialog(true)
  }

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment({ ...department })
    setShowEditDialog(true)
  }

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !editingDepartment) {
      toast.error('Error en la actualización')
      return
    }

    setUpdating(true)

    try {
      const { id, fecha_creacion, fecha_actualizacion, edificio_id, ...updateData } = editingDepartment

      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          currentUserUid: user.uid
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Departamento actualizado exitosamente')
        setShowEditDialog(false)
        setEditingDepartment(null)
        setDeletingImages([])
        setEditUploadedImages([])
        fetchDepartments()
      } else {
        toast.error(data.error || 'Error al actualizar departamento')
      }
    } catch (error) {
      console.error('Error al actualizar departamento:', error)
      toast.error('Error al actualizar departamento')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!user || !editingDepartment) {
      toast.error('Error en la eliminación')
      return
    }

    // Confirmación antes de eliminar
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
      return
    }

    // Agregar imagen a la lista de imágenes siendo eliminadas
    setDeletingImages(prev => [...prev, imageUrl])

    try {
      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_images',
          imageUrls: [imageUrl],
          currentUserUid: user.uid
        })
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar el departamento en edición con las imágenes restantes
        setEditingDepartment(prev => prev ? {
          ...prev,
          imagenes: data.data.imagenes
        } : null)
        
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Error al eliminar imagen')
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      toast.error('Error al eliminar imagen')
    } finally {
      // Remover imagen de la lista de imágenes siendo eliminadas
      setDeletingImages(prev => prev.filter(url => url !== imageUrl))
    }
  }

  const nextImage = () => {
    if (selectedDepartment && selectedDepartment.imagenes.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedDepartment.imagenes.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedDepartment && selectedDepartment.imagenes.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedDepartment.imagenes.length - 1 : prev - 1
      )
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setUploadedImages(Array.from(files))
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setEditUploadedImages((prev) => [...prev, ...Array.from(files)])
    }
  }

  const removeEditImage = (index: number) => {
    setEditUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadNewImages = async () => {
    if (!user || !editingDepartment || editUploadedImages.length === 0) {
      return
    }

    setUploadingNewImages(true)

    try {
      const formData = new FormData()
      
      // Agregar imágenes nuevas
      editUploadedImages.forEach((file) => {
        formData.append('images', file)
      })

      // Agregar datos necesarios
      formData.append('edificio_id', editingDepartment.edificio_id.toString())
      formData.append('departamento_id', editingDepartment.id.toString())
      formData.append('departamento_numero', editingDepartment.numero)
      formData.append('currentUserUid', user.uid)
      formData.append('buildingPermalink', buildingPermalink)

      const response = await fetch('/api/departments/upload-images', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar el departamento en edición con las nuevas imágenes
        const newImageUrls = data.imageUrls || []
        setEditingDepartment(prev => prev ? {
          ...prev,
          imagenes: [...prev.imagenes, ...newImageUrls]
        } : null)
        
        // Limpiar imágenes subidas
        setEditUploadedImages([])
        
        toast.success(`${newImageUrls.length} imagen(es) agregada(s) exitosamente`)
      } else {
        toast.error(data.error || 'Error al subir imágenes')
      }
    } catch (error) {
      console.error('Error al subir nuevas imágenes:', error)
      toast.error('Error al subir imágenes')
    } finally {
      setUploadingNewImages(false)
    }
  }

  const toggleDisponibilidad = async (id: number) => {
    try {
      const response = await fetch(`/api/departments/${id}/toggle-availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserUid: user?.uid
        })
      })

      const data = await response.json()

      if (data.success) {
        setDepartamentos((prev) => 
          prev.map((dept) => 
            dept.id === id ? { ...dept, disponible: data.data.disponible } : dept
          )
        )
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Error al cambiar disponibilidad')
      }
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error)
      toast.error('Error al cambiar disponibilidad')
    }
  }

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('No estás autenticado')
      return
    }

    // Validación condicional
    if (newApartment.tipo === 'venta' && (!newApartment.valor_venta || Number(newApartment.valor_venta) <= 0)) {
      toast.error('El valor de venta es obligatorio para departamentos en venta')
      return
    }
    if (newApartment.tipo === 'arriendo' && (!newApartment.valor_arriendo || Number(newApartment.valor_arriendo) <= 0)) {
      toast.error('El valor de arriendo es obligatorio para departamentos en arriendo')
      return
    }
    if (newApartment.tipo === 'arriendo' && (!newApartment.alicuota || Number(newApartment.alicuota) <= 0)) {
      toast.error('El valor de alícuota es obligatorio para departamentos en arriendo')
      return
    }
    if (newApartment.tipo === 'arriendo y venta') {
      if ((!newApartment.valor_venta || Number(newApartment.valor_venta) <= 0) && (!newApartment.valor_arriendo || Number(newApartment.valor_arriendo) <= 0)) {
        toast.error('Debes ingresar al menos un valor de venta o arriendo para departamentos en arriendo y venta')
        return
      }
      if (!newApartment.alicuota || Number(newApartment.alicuota) <= 0) {
        toast.error('El valor de alícuota es obligatorio para departamentos en arriendo y venta')
        return
      }
    }

    setCreating(true)

    try {
      const formData = new FormData()
      
      // Agregar datos del departamento
      formData.append('edificio_id', buildingId.toString())
      formData.append('numero', newApartment.numero)
      formData.append('nombre', newApartment.nombre)
      formData.append('piso', newApartment.piso)
      formData.append('area_total', ((parseFloat(newApartment.area_cubierta) || 0) + (parseFloat(newApartment.area_descubierta) || 0)).toString())
      formData.append('area_cubierta', newApartment.area_cubierta)
      formData.append('area_descubierta', newApartment.area_descubierta)
      formData.append('cantidad_banos', newApartment.cantidad_banos)
      formData.append('valor_arriendo', newApartment.valor_arriendo)
      formData.append('valor_venta', newApartment.valor_venta)
      formData.append('alicuota', newApartment.alicuota)
      formData.append('incluye_alicuota', newApartment.incluye_alicuota.toString())
      formData.append('cantidad_habitaciones', newApartment.cantidad_habitaciones)
      formData.append('tipo', newApartment.tipo)
      formData.append('estado', newApartment.estado)
      formData.append('ideal_para', newApartment.ideal_para)
      formData.append('descripcion', newApartment.descripcion)
      formData.append('currentUserUid', user.uid)
      formData.append('buildingPermalink', buildingPermalink)

      // Agregar ambientes y adicionales
      formData.append('ambientes_y_adicionales', JSON.stringify(newApartment.ambientes_y_adicionales))
      
      // Agregar características adicionales
      formData.append('tiene_bodega', newApartment.tiene_bodega.toString())
      
      // Agregar videos
      formData.append('videos_url', JSON.stringify(newApartment.videos_url))

      // Agregar imágenes
      uploadedImages.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch('/api/departments', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setShowCreateForm(false)
        setUploadedImages([])
        
        // Reset form
        setNewApartment({
          numero: "",
          nombre: "",
          piso: "",
          area_total: "",
          area_cubierta: "",
          area_descubierta: "",
          cantidad_banos: "1",
          valor_arriendo: "",
          valor_venta: "",
          alicuota: "",
          incluye_alicuota: false,
          cantidad_habitaciones: "",
          tipo: "",
          estado: "",
          ideal_para: "",
          ambientes_y_adicionales: [],
          tiene_bodega: false,
          videos_url: [],
          descripcion: "",
        })

        // Recargar departamentos
        fetchDepartments()
      } else {
        toast.error(data.error || 'Error al crear departamento')
      }
    } catch (error) {
      console.error('Error al crear departamento:', error)
      toast.error('Error al crear departamento')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2">Cargando departamentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
            Departamentos - {buildingName}
          </h2>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
            Gestiona todos los departamentos de este edificio
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className={`bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'w-full' : ''}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Departamento
        </Button>
      </div>

      {/* Estadísticas */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-4 gap-4'}`}>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <Home className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-orange-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Total</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{departamentos.length}</p>
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
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{departamentos.filter((d) => d.disponible).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <EyeOff className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>No disponibles</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{departamentos.filter((d) => !d.disponible).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-2">
              <Maximize className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Área prom.</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  {(() => {
                    const areas = departamentos
                      .map((d) => Number(d.area_total))
                      .filter((a) => !isNaN(a) && a > 0)
                    if (areas.length === 0) return 0
                    return Math.round(areas.reduce((acc, a) => acc + a, 0) / areas.length)
                  })()}m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de departamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {departamentos.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay departamentos registrados</p>
              <p className="text-sm text-gray-500 mt-2">
                Crea el primer departamento para este edificio
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Habitaciones</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departamentos.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.numero}</TableCell>
                    <TableCell>{dept.nombre}</TableCell>
                    <TableCell>{dept.piso}</TableCell>
                    <TableCell>{dept.area_total}m²</TableCell>
                    <TableCell>{dept.cantidad_habitaciones}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dept.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {typeof dept.valor_venta === 'number' && dept.valor_venta > 0 && (
                          <div className="text-sm">${dept.valor_venta.toLocaleString()}</div>
                        )}
                        {typeof dept.valor_arriendo === 'number' && dept.valor_arriendo > 0 && (
                          <div className="text-sm text-gray-600">${dept.valor_arriendo}/mes</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dept.disponible ? "default" : "secondary"}>
                        {dept.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDepartment(dept)}
                          title="Ver departamento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditDepartment(dept)}
                          title="Editar departamento"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleDisponibilidad(dept.id)}
                          title={dept.disponible ? "Marcar como no disponible" : "Marcar como disponible"}
                        >
                          {dept.disponible ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver departamento (Vista Rápida) */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment?.nombre} - Departamento {selectedDepartment?.numero}
            </DialogTitle>
            <DialogDescription>
              Vista rápida del departamento en {buildingName}
            </DialogDescription>
          </DialogHeader>

          {selectedDepartment && (
            <div className="space-y-6">
              {/* Galería de imágenes */}
              {selectedDepartment.imagenes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Imágenes</h3>
                  <div className="relative">
                    <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedDepartment.imagenes[currentImageIndex] || "/placeholder.jpg"}
                        alt={`${selectedDepartment.nombre} - Imagen ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                      {selectedDepartment.imagenes.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    {selectedDepartment.imagenes.length > 1 && (
                      <div className="flex justify-center mt-2 space-x-1">
                        {selectedDepartment.imagenes.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-orange-600' : 'bg-gray-300'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información básica */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Piso</Label>
                  <p className="text-lg">{selectedDepartment.piso}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Área total (calculado automáticamente)</Label>
                  <p className="text-lg">{selectedDepartment.area_total}m²</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Habitaciones</Label>
                  <p className="text-lg">{selectedDepartment.cantidad_habitaciones}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Baños</Label>
                  <p className="text-lg">{selectedDepartment.cantidad_banos || 1}</p>
                </div>
              </div>

              {/* Áreas detalladas */}
              {(selectedDepartment.area_cubierta || selectedDepartment.area_descubierta) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDepartment.area_cubierta && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Área cubierta</Label>
                      <p className="text-lg">{selectedDepartment.area_cubierta}m²</p>
                    </div>
                  )}
                  {selectedDepartment.area_descubierta && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Área descubierta</Label>
                      <p className="text-lg">{selectedDepartment.area_descubierta}m²</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bodega */}
              {selectedDepartment.tiene_bodega && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bodega</Label>
                  <Badge variant="secondary">Sí</Badge>
                </div>
              )}

              {/* Precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDepartment.valor_venta && selectedDepartment.valor_venta > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Precio de Venta</Label>
                    <p className="text-2xl font-bold text-green-600">${selectedDepartment.valor_venta.toLocaleString()}</p>
                  </div>
                )}
                {selectedDepartment.valor_arriendo && selectedDepartment.valor_arriendo > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Precio de Arriendo</Label>
                    <p className="text-2xl font-bold text-blue-600">${selectedDepartment.valor_arriendo.toLocaleString()}/mes</p>
                  </div>
                )}
                {selectedDepartment.alicuota && selectedDepartment.alicuota > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Alícuota {selectedDepartment.incluye_alicuota ? '(Incluida)' : '(No incluida)'}
                    </Label>
                    <p className="text-xl font-semibold text-orange-600">
                      ${selectedDepartment.alicuota.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Ambientes y adicionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ambientes y adicionales</h3>
                {selectedDepartment.ambientes_y_adicionales && selectedDepartment.ambientes_y_adicionales.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedDepartment.ambientes_y_adicionales.map((ambiente: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {ambiente}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No se han especificado ambientes y adicionales.</p>
                )}
              </div>

              {/* Videos de YouTube */}
              {selectedDepartment.videos_url && selectedDepartment.videos_url.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDepartment.videos_url.map((videoUrl: string, index: number) => {
                      // Extraer el ID del video de YouTube
                      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
                      if (!videoId) return null
                      
                      return (
                        <div key={index} className="aspect-video">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`Video ${index + 1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                {selectedDepartment.agente_venta_id && (
                  <Badge variant="success">
                    Vendido el {new Date(selectedDepartment.fecha_venta).toLocaleDateString()}
                  </Badge>
                )}
                {selectedDepartment.agente_arriendo_id && (
                  <Badge variant="info">
                    Arrendado el {new Date(selectedDepartment.fecha_arriendo).toLocaleDateString()}
                  </Badge>
                )}
                {/* Botón de registrar transacción eliminado */}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowViewDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar departamento */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogDescription>
              Modifica la información del departamento {editingDepartment?.numero} en {buildingName}
            </DialogDescription>
          </DialogHeader>

          {editingDepartment && (
            <form onSubmit={handleUpdateDepartment} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-numero">Número *</Label>
                    <Input
                      id="edit-numero"
                      value={editingDepartment.numero}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, numero: e.target.value } : null)}
                      placeholder="Ej: 101"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-piso">Piso *</Label>
                    <Input
                      id="edit-piso"
                      type="number"
                      value={editingDepartment.piso}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, piso: parseInt(e.target.value) || 1 } : null)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-area">Área (m²) - Calculado automáticamente</Label>
                    <Input
                      id="edit-area"
                      type="number"
                      step="0.1"
                      value={editingDepartment.area_total}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, area_total: parseFloat(e.target.value) || 0 } : null)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-nombre">Nombre del departamento *</Label>
                  <Input
                    id="edit-nombre"
                    value={editingDepartment.nombre}
                    onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                    placeholder="Ej: Departamento Ejecutivo"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Características principales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Características Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="edit-habitaciones">Habitaciones *</Label>
                    <Select
                      value={editingDepartment.cantidad_habitaciones}
                      onValueChange={(value) => setEditingDepartment(prev => prev ? { ...prev, cantidad_habitaciones: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Loft">Loft</SelectItem>
                        <SelectItem value="Suite">Suite</SelectItem>
                        <SelectItem value="2">2 habitaciones</SelectItem>
                        <SelectItem value="3">3 habitaciones</SelectItem>
                        <SelectItem value="4">4 o más habitaciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-cantidad_banos">Cantidad de baños *</Label>
                    <Select
                      value={editingDepartment.cantidad_banos}
                      onValueChange={(value) => setEditingDepartment(prev => prev ? { ...prev, cantidad_banos: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 baño</SelectItem>
                        <SelectItem value="2">2 baños</SelectItem>
                        <SelectItem value="3">3 baños</SelectItem>
                        <SelectItem value="4">4 o más baños</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-tipo">Tipo de operación *</Label>
                    <Select
                      value={editingDepartment.tipo}
                      onValueChange={(value) => setEditingDepartment(prev => prev ? { ...prev, tipo: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arriendo">Arriendo</SelectItem>
                        <SelectItem value="venta">Venta</SelectItem>
                        <SelectItem value="arriendo y venta">Arriendo y venta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-estado">Estado *</Label>
                    <Select
                      value={editingDepartment.estado}
                      onValueChange={(value) => setEditingDepartment(prev => prev ? { ...prev, estado: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo</SelectItem>
                        <SelectItem value="poco_uso">Poco uso</SelectItem>
                        <SelectItem value="un_ano">Un año</SelectItem>
                        <SelectItem value="mas_de_un_ano">Más de un año</SelectItem>
                        <SelectItem value="remodelar">Remodelar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-ideal_para">Ideal para *</Label>
                    <Select
                      value={editingDepartment.ideal_para}
                      onValueChange={(value) => setEditingDepartment(prev => prev ? { ...prev, ideal_para: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="persona_sola">Persona sola</SelectItem>
                        <SelectItem value="pareja">Pareja</SelectItem>
                        <SelectItem value="profesional">Profesional</SelectItem>
                        <SelectItem value="familia">Familia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Precios */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Precios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-valor_venta">Valor de venta (USD)</Label>
                    <Input
                      id="edit-valor_venta"
                      type="number"
                      value={editingDepartment?.valor_venta === 0 ? '' : editingDepartment?.valor_venta || ''}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, valor_venta: e.target.value === '' ? '' : parseInt(e.target.value) } : null)}
                      placeholder="Ej: 25000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-valor_arriendo">Valor de arriendo (USD/mes)</Label>
                    <Input
                      id="edit-valor_arriendo"
                      type="number"
                      value={editingDepartment?.valor_arriendo === 0 ? '' : editingDepartment?.valor_arriendo || ''}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, valor_arriendo: e.target.value === '' ? '' : parseInt(e.target.value) } : null)}
                      placeholder="Ej: 1200000"
                    />
                  </div>
                </div>
                {/* Alícuota (solo arriendo o arriendo y venta) */}
                {(editingDepartment.tipo === 'arriendo' || editingDepartment.tipo === 'arriendo y venta') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-alicuota">Valor de alícuota (USD)*</Label>
                      <Input
                        id="edit-alicuota"
                        type="number"
                        value={editingDepartment.alicuota === 0 ? '' : editingDepartment.alicuota || ''}
                        onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, alicuota: e.target.value === '' ? '' : parseInt(e.target.value) } : null)}
                        placeholder="Ej: 50000"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6 md:mt-0">
                      <Checkbox
                        id="edit-incluye-alicuota"
                        checked={editingDepartment.incluye_alicuota || false}
                        onCheckedChange={(checked) => setEditingDepartment(prev => prev ? { ...prev, incluye_alicuota: checked as boolean } : null)}
                      />
                      <Label htmlFor="edit-incluye-alicuota">Incluye alícuota</Label>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Ambientes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ambientes y adicionales</h3>
                <TagSelector
                  selectedItems={editingDepartment?.ambientes_y_adicionales || []}
                  onItemsChange={(items) => setEditingDepartment(prev => prev ? { ...prev, ambientes_y_adicionales: items } : null)}
                  availableItems={ambientesYAdicionalesDisponibles}
                  placeholder="Seleccionar ambientes y adicionales..."
                  label="Ambientes y adicionales"
                />
              </div>

              <Separator />

              {/* Disponibilidad */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Disponibilidad</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-disponible"
                    checked={editingDepartment.disponible}
                    onCheckedChange={(checked) =>
                      setEditingDepartment(prev => prev ? { ...prev, disponible: checked as boolean } : null)
                    }
                  />
                  <Label htmlFor="edit-disponible">Departamento disponible</Label>
                </div>
              </div>

              <Separator />

              {/* Gestión de imágenes existentes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Imágenes del Departamento</h3>
                
                {editingDepartment.imagenes && editingDepartment.imagenes.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Imágenes actuales ({editingDepartment.imagenes.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {editingDepartment.imagenes.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={`${editingDepartment.nombre} - Imagen ${index + 1}`}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            {/* Overlay con botón eliminar */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteImage(imageUrl)}
                                disabled={deletingImages.includes(imageUrl)}
                                className="gap-2"
                              >
                                {deletingImages.includes(imageUrl) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                                {deletingImages.includes(imageUrl) ? 'Eliminando...' : 'Eliminar'}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-1">
                            Imagen {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {editingDepartment.imagenes.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No hay imágenes</p>
                        <p className="text-sm text-gray-500">Agrega imágenes usando el área de carga inferior</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No hay imágenes</p>
                    <p className="text-sm text-gray-500">Agrega imágenes usando el área de carga inferior</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Gestión de imágenes:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• Haz clic en "Eliminar" sobre cualquier imagen para removerla permanentemente</li>
                        <li>• Puedes agregar nuevas imágenes usando el área de carga inferior</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Agregar nuevas imágenes */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900">Agregar Nuevas Imágenes</h4>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o</p>
                    <Label htmlFor="edit-apartment-images" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Seleccionar imágenes</span>
                      </Button>
                    </Label>
                    <Input
                      id="edit-apartment-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditImageUpload}
                    />
                  </div>

                  {editUploadedImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          Imágenes a subir ({editUploadedImages.length})
                        </p>
                        <Button
                          type="button"
                          onClick={handleUploadNewImages}
                          disabled={uploadingNewImages}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {uploadingNewImages ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {uploadingNewImages ? 'Subiendo...' : 'Subir Imágenes'}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {editUploadedImages.map((file, index) => (
                          <div key={index} className="relative">
                            <div className="aspect-square relative bg-gray-100 rounded border overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Nueva imagen ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeEditImage(index)}
                              disabled={uploadingNewImages}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <p className="text-xs text-center text-gray-500 mt-1">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false)
                    setEditingDepartment(null)
                    setDeletingImages([])
                    setEditUploadedImages([])
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  {updating ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para crear departamento */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Departamento</DialogTitle>
            <DialogDescription>Complete toda la información del departamento para {buildingName}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateApartment} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={newApartment.numero}
                    onChange={(e) => setNewApartment((prev) => ({ ...prev, numero: e.target.value }))}
                    placeholder="Ej: 101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="piso">Piso *</Label>
                  <Input
                    id="piso"
                    type="number"
                    value={newApartment.piso}
                    onChange={(e) =>
                      setNewApartment((prev) => ({ ...prev, piso: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area_total">Área total (m²) - calculado automaticamente*</Label>
                  <Input
                    id="area_total"
                    type="number"
                    step="0.1"
                    value={
                      (parseFloat(newApartment.area_cubierta) || 0) + (parseFloat(newApartment.area_descubierta) || 0)
                    }
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="area_cubierta">Área cubierta (m²)</Label>
                  <Input
                    id="area_cubierta"
                    type="number"
                    step="0.1"
                    value={newApartment.area_cubierta}
                    onChange={(e) =>
                      setNewApartment((prev) => ({ ...prev, area_cubierta: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="area_descubierta">Área descubierta (m²)</Label>
                  <Input
                    id="area_descubierta"
                    type="number"
                    step="0.1"
                    value={newApartment.area_descubierta}
                    onChange={(e) =>
                      setNewApartment((prev) => ({ ...prev, area_descubierta: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nombre">Nombre del departamento *</Label>
                <Input
                  id="nombre"
                  value={newApartment.nombre}
                  onChange={(e) => setNewApartment((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Departamento Ejecutivo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <textarea
                  id="descripcion"
                  value={newApartment.descripcion}
                  onChange={(e) => setNewApartment((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el departamento..."
                  required
                  className="w-full min-h-[80px] border rounded p-2"
                />
              </div>
            </div>

            <Separator />

            {/* Características principales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Características Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="habitaciones">Habitaciones *</Label>
                  <Select
                    value={newApartment.cantidad_habitaciones}
                    onValueChange={(value) => setNewApartment((prev) => ({ ...prev, cantidad_habitaciones: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Loft">Loft</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="2">2 habitaciones</SelectItem>
                      <SelectItem value="3">3 habitaciones</SelectItem>
                      <SelectItem value="4">4 o más habitaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cantidad_banos">Cantidad de baños *</Label>
                  <Select
                    value={newApartment.cantidad_banos}
                    onValueChange={(value) => setNewApartment((prev) => ({ ...prev, cantidad_banos: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 baño</SelectItem>
                      <SelectItem value="2">2 baños</SelectItem>
                      <SelectItem value="3">3 baños</SelectItem>
                      <SelectItem value="4">4 o más baños</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de operación *</Label>
                  <Select
                    value={newApartment.tipo}
                    onValueChange={(value) => setNewApartment((prev) => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arriendo">Arriendo</SelectItem>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="arriendo y venta">Arriendo y venta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={newApartment.estado}
                    onValueChange={(value) => setNewApartment((prev) => ({ ...prev, estado: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                      <SelectItem value="poco_uso">Poco uso</SelectItem>
                      <SelectItem value="un_ano">Un año</SelectItem>
                      <SelectItem value="mas_de_un_ano">Más de un año</SelectItem>
                      <SelectItem value="remodelar">Remodelar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ideal_para">Ideal para *</Label>
                  <Select
                    value={newApartment.ideal_para}
                    onValueChange={(value) => setNewApartment((prev) => ({ ...prev, ideal_para: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="persona_sola">Persona sola</SelectItem>
                      <SelectItem value="pareja">Pareja</SelectItem>
                      <SelectItem value="profesional">Profesional</SelectItem>
                      <SelectItem value="familia">Familia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Precios */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Precios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mostrar solo si es venta o arriendo y venta */}
                {(newApartment.tipo === 'venta' || newApartment.tipo === 'arriendo y venta') && (
                  <div>
                    <Label htmlFor="valor_venta">Valor de venta (USD){newApartment.tipo === 'venta' ? ' *' : ''}</Label>
                    <Input
                      id="valor_venta"
                      type="number"
                      value={newApartment.valor_venta}
                      onChange={(e) =>
                        setNewApartment((prev) => ({ ...prev, valor_venta: e.target.value }))
                      }
                      placeholder="Ej: 25000000"
                      required={newApartment.tipo === 'venta'}
                    />
                  </div>
                )}
                {/* Mostrar solo si es arriendo o arriendo y venta */}
                {(newApartment.tipo === 'arriendo' || newApartment.tipo === 'arriendo y venta') && (
                  <div>
                    <Label htmlFor="valor_arriendo">Valor de arriendo (USD/mes){newApartment.tipo === 'arriendo' ? ' *' : ''}</Label>
                    <Input
                      id="valor_arriendo"
                      type="number"
                      value={newApartment.valor_arriendo}
                      onChange={(e) =>
                        setNewApartment((prev) => ({ ...prev, valor_arriendo: e.target.value }))
                      }
                      placeholder="Ej: 1200000"
                      required={newApartment.tipo === 'arriendo'}
                    />
                  </div>
                )}
              </div>

              {/* Alícuota (solo para arriendo o arriendo y venta) */}
              {(newApartment.tipo === 'arriendo' || newApartment.tipo === 'arriendo y venta') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="alicuota">Valor de alícuota (USD)*</Label>
                    <Input
                      id="alicuota"
                      type="number"
                      value={newApartment.alicuota}
                      onChange={(e) =>
                        setNewApartment((prev) => ({ ...prev, alicuota: e.target.value }))
                      }
                      placeholder="Ej: 50000"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6 md:mt-0">
                    <Checkbox
                      id="incluye_alicuota"
                      checked={newApartment.incluye_alicuota}
                      onCheckedChange={(checked) =>
                        setNewApartment((prev) => ({ ...prev, incluye_alicuota: checked as boolean }))
                      }
                    />
                    <Label htmlFor="incluye_alicuota">Incluye alícuota</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Ambientes y adicionales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ambientes y adicionales</h3>
              <TagSelector
                selectedItems={newApartment.ambientes_y_adicionales}
                onItemsChange={(items) => setNewApartment((prev) => ({ ...prev, ambientes_y_adicionales: items }))}
                availableItems={ambientesYAdicionalesDisponibles}
                placeholder="Seleccionar ambientes y adicionales..."
                label="Ambientes y adicionales"
              />
            </div>

            <Separator />

            {/* Características adicionales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Características adicionales</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tiene_bodega"
                  checked={newApartment.tiene_bodega}
                  onCheckedChange={(checked) =>
                    setNewApartment((prev) => ({ ...prev, tiene_bodega: checked as boolean }))
                  }
                />
                <Label htmlFor="tiene_bodega">Tiene bodega</Label>
              </div>
            </div>

            <Separator />

            {/* Videos de YouTube */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Videos de YouTube</h3>
              <TagSelector
                selectedItems={newApartment.videos_url}
                onItemsChange={(items) => setNewApartment((prev) => ({ ...prev, videos_url: items }))}
                availableItems={[]}
                placeholder="Agregar URL de video de YouTube..."
                label="Videos"
                allowCustom={true}
              />
              <p className="text-sm text-gray-500">
                Ejemplo: https://www.youtube.com/watch?v=VIDEO_ID
              </p>
            </div>

            <Separator />

            {/* Imágenes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Imágenes del Departamento</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o</p>
                <Label htmlFor="apartment-images" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Seleccionar imágenes</span>
                  </Button>
                </Label>
                <Input
                  id="apartment-images"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {creating ? "Creando..." : "Crear Departamento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para transacciones */}
      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        departamentoId={selectedDepartment?.id}
        departamentoNombre={selectedDepartment?.nombre}
        edificioNombre={buildingName}
        precioOriginal={selectedDepartment?.valor_arriendo || selectedDepartment?.valor_venta}
        onTransactionComplete={() => {
          fetchDepartments()
          setIsTransactionDialogOpen(false)
        }}
        agents={agents}
      />
    </div>
  )
}
