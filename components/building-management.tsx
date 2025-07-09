"use client"

import type React from "react"

import { useState } from "react"
import { Upload, QrCode, Building2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function BuildingManagement() {
  const [buildingData, setBuildingData] = useState({
    nombre: "",
    direccion: "",
    descripcion: "",
    areas_comunales: [] as string[],
    seguridad: {
      tipo: "",
      camaras: false,
      acceso_controlado: false,
      intercomunicador: false,
      alarma: false,
    },
    aparcamiento: {
      tipo: "",
      espacios_totales: 0,
      espacios_visitantes: 0,
      acceso_automatico: false,
      vigilancia: false,
    },
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [qrGenerated, setQrGenerated] = useState(false)

  const areasComunes = [
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

  const handleAreaComunalChange = (area: string, checked: boolean) => {
    setBuildingData((prev) => ({
      ...prev,
      areas_comunales: checked ? [...prev.areas_comunales, area] : prev.areas_comunales.filter((a) => a !== area),
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Simular carga de imágenes
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setUploadedImages((prev) => [...prev, ...newImages])
    }
  }

  const generateQR = () => {
    // Simular generación de QR
    setQrGenerated(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Datos del edificio:", buildingData)
    console.log("Imágenes:", uploadedImages)
    // Aquí iría la lógica para guardar el edificio
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Edificios</h2>
          <p className="text-gray-600">Crear y administrar edificios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                Crear Nuevo Edificio
              </CardTitle>
              <CardDescription>Complete la información básica del edificio</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del edificio</Label>
                      <Input
                        id="nombre"
                        value={buildingData.nombre}
                        onChange={(e) => setBuildingData((prev) => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej: Edificio Mirador"
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={buildingData.direccion}
                        onChange={(e) => setBuildingData((prev) => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Ej: Av. Principal 123"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={buildingData.descripcion}
                      onChange={(e) => setBuildingData((prev) => ({ ...prev, descripcion: e.target.value }))}
                      placeholder="Descripción detallada del edificio..."
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Áreas comunales */}
                <div>
                  <Label className="text-base font-semibold">Áreas Comunales</Label>
                  <p className="text-sm text-gray-600 mb-3">Seleccione las áreas comunales disponibles</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {areasComunes.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={buildingData.areas_comunales.includes(area)}
                          onCheckedChange={(checked) => handleAreaComunalChange(area, checked as boolean)}
                        />
                        <Label htmlFor={area} className="text-sm">
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Seguridad */}
                <div>
                  <Label className="text-base font-semibold">Seguridad</Label>
                  <div className="space-y-4 mt-3">
                    <div>
                      <Label htmlFor="tipo-seguridad">Tipo de seguridad</Label>
                      <Input
                        id="tipo-seguridad"
                        value={buildingData.seguridad.tipo}
                        onChange={(e) =>
                          setBuildingData((prev) => ({
                            ...prev,
                            seguridad: { ...prev.seguridad, tipo: e.target.value },
                          }))
                        }
                        placeholder="Ej: 24/7 con portero"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="camaras"
                          checked={buildingData.seguridad.camaras}
                          onCheckedChange={(checked) =>
                            setBuildingData((prev) => ({
                              ...prev,
                              seguridad: { ...prev.seguridad, camaras: checked as boolean },
                            }))
                          }
                        />
                        <Label htmlFor="camaras">Cámaras de seguridad</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="acceso-controlado"
                          checked={buildingData.seguridad.acceso_controlado}
                          onCheckedChange={(checked) =>
                            setBuildingData((prev) => ({
                              ...prev,
                              seguridad: { ...prev.seguridad, acceso_controlado: checked as boolean },
                            }))
                          }
                        />
                        <Label htmlFor="acceso-controlado">Acceso controlado</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="intercomunicador"
                          checked={buildingData.seguridad.intercomunicador}
                          onCheckedChange={(checked) =>
                            setBuildingData((prev) => ({
                              ...prev,
                              seguridad: { ...prev.seguridad, intercomunicador: checked as boolean },
                            }))
                          }
                        />
                        <Label htmlFor="intercomunicador">Intercomunicador</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="alarma"
                          checked={buildingData.seguridad.alarma}
                          onCheckedChange={(checked) =>
                            setBuildingData((prev) => ({
                              ...prev,
                              seguridad: { ...prev.seguridad, alarma: checked as boolean },
                            }))
                          }
                        />
                        <Label htmlFor="alarma">Sistema de alarma</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Aparcamiento */}
                <div>
                  <Label className="text-base font-semibold">Aparcamiento</Label>
                  <div className="space-y-4 mt-3">
                    <div>
                      <Label htmlFor="tipo-aparcamiento">Tipo de aparcamiento</Label>
                      <Input
                        id="tipo-aparcamiento"
                        value={buildingData.aparcamiento.tipo}
                        onChange={(e) =>
                          setBuildingData((prev) => ({
                            ...prev,
                            aparcamiento: { ...prev.aparcamiento, tipo: e.target.value },
                          }))
                        }
                        placeholder="Ej: Subterráneo cubierto"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="espacios-totales">Espacios totales</Label>
                        <Input
                          id="espacios-totales"
                          type="number"
                          value={buildingData.aparcamiento.espacios_totales === 0 ? '' : buildingData.aparcamiento.espacios_totales || ''}
                          onChange={(e) => setBuildingData((prev) => ({
                            ...prev,
                            aparcamiento: {
                              ...prev.aparcamiento,
                              espacios_totales: e.target.value === '' ? '' : Number.parseInt(e.target.value),
                            },
                          }))}
                          placeholder="Ej: 45"
                        />
                      </div>
                      <div>
                        <Label htmlFor="espacios-visitantes">Espacios visitantes</Label>
                        <Input
                          id="espacios-visitantes"
                          type="number"
                          value={buildingData.aparcamiento.espacios_visitantes === 0 ? '' : buildingData.aparcamiento.espacios_visitantes || ''}
                          onChange={(e) => setBuildingData((prev) => ({
                            ...prev,
                            aparcamiento: {
                              ...prev.aparcamiento,
                              espacios_visitantes: e.target.value === '' ? '' : Number.parseInt(e.target.value),
                            },
                          }))}
                          placeholder="Ej: 8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="acceso-automatico"
                          checked={buildingData.aparcamiento.acceso_automatico}
                          onCheckedChange={(checked) =>
                            setBuildingData((prev) => ({
                              ...prev,
                              aparcamiento: { ...prev.aparcamiento, acceso_automatico: checked as boolean },
                            }))
                          }
                        />
                        <Label htmlFor="acceso-automatico">Acceso automático</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vigilancia-parking"
                          checked={buildingData.aparcamiento.vigilancia}
                          onCheckedChange={(checked) =>
                            setBuildingData((prev) => ({
                              ...prev,
                              aparcamiento: { ...prev.aparcamiento, vigilancia: checked as boolean },
                            }))
                          }
                        />
                        <Label htmlFor="vigilancia-parking">Vigilancia 24/7</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    Crear Edificio
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Subir imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                Imágenes del Edificio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o</p>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>Seleccionar archivos</span>
                    </Button>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Imágenes cargadas:</p>
                    <div className="space-y-1">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          Imagen {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generar QR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                Código QR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Genera un código QR para que los visitantes accedan fácilmente a la información del edificio.
                </p>
                <Button
                  onClick={generateQR}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  disabled={!buildingData.nombre}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generar QR
                </Button>
                {qrGenerated && (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-green-600 mt-2">QR generado exitosamente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Áreas comunales:</span>
                  <Badge variant="secondary">{buildingData.areas_comunales.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Imágenes:</span>
                  <Badge variant="secondary">{uploadedImages.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Espacios parking:</span>
                  <Badge variant="secondary">{buildingData.aparcamiento.espacios_totales}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
