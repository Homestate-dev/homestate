"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Eye, Edit, EyeOff, Home, Maximize, Upload, X } from "lucide-react"
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

// Datos de ejemplo de departamentos
const departamentosEjemplo = [
  {
    id: 1,
    numero: "101",
    nombre: "Departamento Ejecutivo",
    piso: 1,
    area: 85.5,
    valor_arriendo: 1200,
    valor_venta: 150000,
    disponible: true,
    cantidad_habitaciones: "2",
    tipo: "arriendo y venta",
    estado: "nuevo",
    ideal_para: "familia",
    imagenes: ["img1.jpg", "img2.jpg"],
  },
  {
    id: 2,
    numero: "102",
    nombre: "Departamento Familiar",
    piso: 1,
    area: 120,
    valor_venta: 180000,
    disponible: true,
    cantidad_habitaciones: "3",
    tipo: "venta",
    estado: "poco_uso",
    ideal_para: "familia",
    imagenes: ["img3.jpg"],
  },
]

interface ApartmentManagementProps {
  buildingId: number
  buildingName: string
}

export function ApartmentManagement({ buildingId, buildingName }: ApartmentManagementProps) {
  const [departamentos, setDepartamentos] = useState(departamentosEjemplo)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setUploadedImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleDisponibilidad = (id: number) => {
    setDepartamentos((prev) => prev.map((dept) => (dept.id === id ? { ...dept, disponible: !dept.disponible } : dept)))
  }

  const handleCreateApartment = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = Math.max(...departamentos.map((d) => d.id)) + 1
    setDepartamentos((prev) => [
      ...prev,
      {
        ...newApartment,
        id: newId,
        disponible: true,
        imagenes: uploadedImages,
      },
    ])
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
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departamentos - {buildingName}</h2>
          <p className="text-gray-600">Gestiona todos los departamentos de este edificio</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Departamento
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{departamentos.length}</p>
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
                <p className="text-2xl font-bold">{departamentos.filter((d) => d.disponible).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">No disponibles</p>
                <p className="text-2xl font-bold">{departamentos.filter((d) => !d.disponible).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Maximize className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Área promedio</p>
                <p className="text-2xl font-bold">
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
                      {dept.valor_venta && <div className="text-sm">${dept.valor_venta.toLocaleString()}</div>}
                      {dept.valor_arriendo && <div className="text-sm text-gray-600">${dept.valor_arriendo}/mes</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.disponible ? "default" : "secondary"}>
                      {dept.disponible ? "Disponible" : "No disponible"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleDisponibilidad(dept.id)}>
                        {dept.disponible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image || "/placeholder.svg"}
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
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Crear Departamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
