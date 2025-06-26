"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, EyeOff, Home, Maximize, Upload, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
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

interface Department {
  id: number
  edificio_id: number
  numero: string
  nombre: string
  piso: number
  area: number
  valor_arriendo?: number
  valor_venta?: number
  disponible: boolean
  cantidad_habitaciones: string
  tipo: string
  estado: string
  ideal_para: string
  amueblado: boolean
  tiene_living_comedor: boolean
  tiene_cocina_separada: boolean
  tiene_antebano: boolean
  tiene_bano_completo: boolean
  tiene_aire_acondicionado: boolean
  tiene_placares: boolean
  tiene_cocina_con_horno_y_anafe: boolean
  tiene_muebles_bajo_mesada: boolean
  tiene_desayunador_madera: boolean
  imagenes: string[]
  fecha_creacion: string
  fecha_actualizacion: string
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
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()

  const [newApartment, setNewApartment] = useState({
    numero: "",
    nombre: "",
    piso: 1,
    area: 0,
    valor_arriendo: 0,
    valor_venta: 0,
    cantidad_habitaciones: "",
    tipo: "",
    estado: "",
    ideal_para: "",
    amueblado: false,
    tiene_living_comedor: false,
    tiene_cocina_separada: false,
    tiene_antebano: false,
    tiene_bano_completo: false,
    tiene_aire_acondicionado: false,
    tiene_placares: false,
    tiene_cocina_con_horno_y_anafe: false,
    tiene_muebles_bajo_mesada: false,
    tiene_desayunador_madera: false,
  })

  useEffect(() => {
    fetchDepartments()
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

    setCreating(true)

    try {
      const formData = new FormData()
      
      // Agregar datos del departamento
      formData.append('edificio_id', buildingId.toString())
      formData.append('numero', newApartment.numero)
      formData.append('nombre', newApartment.nombre)
      formData.append('piso', newApartment.piso.toString())
      formData.append('area', newApartment.area.toString())
      formData.append('valor_arriendo', newApartment.valor_arriendo.toString())
      formData.append('valor_venta', newApartment.valor_venta.toString())
      formData.append('cantidad_habitaciones', newApartment.cantidad_habitaciones)
      formData.append('tipo', newApartment.tipo)
      formData.append('estado', newApartment.estado)
      formData.append('ideal_para', newApartment.ideal_para)
      formData.append('currentUserUid', user.uid)
      formData.append('buildingPermalink', buildingPermalink)

      // Agregar características booleanas
      formData.append('amueblado', newApartment.amueblado.toString())
      formData.append('tiene_living_comedor', newApartment.tiene_living_comedor.toString())
      formData.append('tiene_cocina_separada', newApartment.tiene_cocina_separada.toString())
      formData.append('tiene_antebano', newApartment.tiene_antebano.toString())
      formData.append('tiene_bano_completo', newApartment.tiene_bano_completo.toString())
      formData.append('tiene_aire_acondicionado', newApartment.tiene_aire_acondicionado.toString())
      formData.append('tiene_placares', newApartment.tiene_placares.toString())
      formData.append('tiene_cocina_con_horno_y_anafe', newApartment.tiene_cocina_con_horno_y_anafe.toString())
      formData.append('tiene_muebles_bajo_mesada', newApartment.tiene_muebles_bajo_mesada.toString())
      formData.append('tiene_desayunador_madera', newApartment.tiene_desayunador_madera.toString())

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
          piso: 1,
          area: 0,
          valor_arriendo: 0,
          valor_venta: 0,
          cantidad_habitaciones: "",
          tipo: "",
          estado: "",
          ideal_para: "",
          amueblado: false,
          tiene_living_comedor: false,
          tiene_cocina_separada: false,
          tiene_antebano: false,
          tiene_bano_completo: false,
          tiene_aire_acondicionado: false,
          tiene_placares: false,
          tiene_cocina_con_horno_y_anafe: false,
          tiene_muebles_bajo_mesada: false,
          tiene_desayunador_madera: false,
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
                  {departamentos.length > 0
                    ? Math.round(departamentos.reduce((acc, d) => acc + d.area, 0) / departamentos.length)
                    : 0}
                  m²
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
                    <TableCell>{dept.area}m²</TableCell>
                    <TableCell>{dept.cantidad_habitaciones}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dept.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {dept.valor_venta && dept.valor_venta > 0 && (
                          <div className="text-sm">${dept.valor_venta.toLocaleString()}</div>
                        )}
                        {dept.valor_arriendo && dept.valor_arriendo > 0 && (
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
                          {dept.disponible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  <Label className="text-sm font-medium text-gray-600">Área</Label>
                  <p className="text-lg">{selectedDepartment.area}m²</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Habitaciones</Label>
                  <p className="text-lg">{selectedDepartment.cantidad_habitaciones}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <Badge variant="outline">{selectedDepartment.estado.replace('_', ' ')}</Badge>
                </div>
              </div>

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
              </div>

              <Separator />

              {/* Características */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Características</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedDepartment.amueblado && <Badge variant="secondary">Amoblado</Badge>}
                  {selectedDepartment.tiene_living_comedor && <Badge variant="secondary">Sala comedor</Badge>}
                  {selectedDepartment.tiene_cocina_separada && <Badge variant="secondary">Cocina separada</Badge>}
                  {selectedDepartment.tiene_antebano && <Badge variant="secondary">Antebaño</Badge>}
                  {selectedDepartment.tiene_bano_completo && <Badge variant="secondary">Baño completo</Badge>}
                  {selectedDepartment.tiene_aire_acondicionado && <Badge variant="secondary">Aire acondicionado</Badge>}
                  {selectedDepartment.tiene_placares && <Badge variant="secondary">Closets</Badge>}
                  {selectedDepartment.tiene_cocina_con_horno_y_anafe && <Badge variant="secondary">Cocina equipada</Badge>}
                  {selectedDepartment.tiene_muebles_bajo_mesada && <Badge variant="secondary">Muebles bajo mesada</Badge>}
                  {selectedDepartment.tiene_desayunador_madera && <Badge variant="secondary">Desayunador de madera</Badge>}
                </div>
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
                    <Label htmlFor="edit-area">Área (m²) *</Label>
                    <Input
                      id="edit-area"
                      type="number"
                      step="0.1"
                      value={editingDepartment.area}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, area: parseFloat(e.target.value) || 0 } : null)}
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
                      value={editingDepartment.valor_venta || 0}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, valor_venta: parseInt(e.target.value) || 0 } : null)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-valor_arriendo">Valor de arriendo (USD/mes)</Label>
                    <Input
                      id="edit-valor_arriendo"
                      type="number"
                      value={editingDepartment.valor_arriendo || 0}
                      onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, valor_arriendo: parseInt(e.target.value) || 0 } : null)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ambientes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ambientes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-amueblado"
                      checked={editingDepartment.amueblado}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, amueblado: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-amueblado">Amoblado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-living_comedor"
                      checked={editingDepartment.tiene_living_comedor}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_living_comedor: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-living_comedor">Sala comedor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-cocina_separada"
                      checked={editingDepartment.tiene_cocina_separada}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_cocina_separada: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-cocina_separada">Cocina separada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-antebano"
                      checked={editingDepartment.tiene_antebano}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_antebano: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-antebano">Antebaño</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-bano_completo"
                      checked={editingDepartment.tiene_bano_completo}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_bano_completo: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-bano_completo">Baño completo</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Equipamiento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Equipamiento</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-aire_acondicionado"
                      checked={editingDepartment.tiene_aire_acondicionado}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_aire_acondicionado: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-aire_acondicionado">Aire acondicionado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-placares"
                      checked={editingDepartment.tiene_placares}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_placares: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-placares">Closets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-cocina_horno_anafe"
                      checked={editingDepartment.tiene_cocina_con_horno_y_anafe}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_cocina_con_horno_y_anafe: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-cocina_horno_anafe">Cocina con horno y anafe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-muebles_bajo_mesada"
                      checked={editingDepartment.tiene_muebles_bajo_mesada}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_muebles_bajo_mesada: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-muebles_bajo_mesada">Muebles bajo mesada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-desayunador_madera"
                      checked={editingDepartment.tiene_desayunador_madera}
                      onCheckedChange={(checked) =>
                        setEditingDepartment(prev => prev ? { ...prev, tiene_desayunador_madera: checked as boolean } : null)
                      }
                    />
                    <Label htmlFor="edit-desayunador_madera">Desayunador de madera</Label>
                  </div>
                </div>
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

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false)
                    setEditingDepartment(null)
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
                      setNewApartment((prev) => ({ ...prev, piso: Number.parseInt(e.target.value) || 1 }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    value={newApartment.area}
                    onChange={(e) =>
                      setNewApartment((prev) => ({ ...prev, area: Number.parseFloat(e.target.value) || 0 }))
                    }
                    required
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
                <div>
                  <Label htmlFor="valor_venta">Valor de venta (USD)</Label>
                  <Input
                    id="valor_venta"
                    type="number"
                    value={newApartment.valor_venta}
                    onChange={(e) =>
                      setNewApartment((prev) => ({ ...prev, valor_venta: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="valor_arriendo">Valor de arriendo (USD/mes)</Label>
                  <Input
                    id="valor_arriendo"
                    type="number"
                    value={newApartment.valor_arriendo}
                    onChange={(e) =>
                      setNewApartment((prev) => ({ ...prev, valor_arriendo: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Ambientes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ambientes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="amueblado"
                    checked={newApartment.amueblado}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, amueblado: checked as boolean }))
                    }
                  />
                  <Label htmlFor="amueblado">Amoblado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="living_comedor"
                    checked={newApartment.tiene_living_comedor}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_living_comedor: checked as boolean }))
                    }
                  />
                  <Label htmlFor="living_comedor">Sala comedor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cocina_separada"
                    checked={newApartment.tiene_cocina_separada}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_cocina_separada: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cocina_separada">Cocina separada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="antebano"
                    checked={newApartment.tiene_antebano}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_antebano: checked as boolean }))
                    }
                  />
                  <Label htmlFor="antebano">Antebaño</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bano_completo"
                    checked={newApartment.tiene_bano_completo}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_bano_completo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="bano_completo">Baño completo</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Equipamiento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Equipamiento</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aire_acondicionado"
                    checked={newApartment.tiene_aire_acondicionado}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_aire_acondicionado: checked as boolean }))
                    }
                  />
                  <Label htmlFor="aire_acondicionado">Aire acondicionado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="placares"
                    checked={newApartment.tiene_placares}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_placares: checked as boolean }))
                    }
                  />
                  <Label htmlFor="placares">Closets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cocina_horno_anafe"
                    checked={newApartment.tiene_cocina_con_horno_y_anafe}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_cocina_con_horno_y_anafe: checked as boolean }))
                    }
                  />
                  <Label htmlFor="cocina_horno_anafe">Cocina con horno y anafe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="muebles_bajo_mesada"
                    checked={newApartment.tiene_muebles_bajo_mesada}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_muebles_bajo_mesada: checked as boolean }))
                    }
                  />
                  <Label htmlFor="muebles_bajo_mesada">Muebles bajo mesada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="desayunador_madera"
                    checked={newApartment.tiene_desayunador_madera}
                    onCheckedChange={(checked) =>
                      setNewApartment((prev) => ({ ...prev, tiene_desayunador_madera: checked as boolean }))
                    }
                  />
                  <Label htmlFor="desayunador_madera">Desayunador de madera</Label>
                </div>
              </div>
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
    </div>
  )
}
