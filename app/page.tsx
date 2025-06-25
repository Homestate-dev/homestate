"use client"
import { useState } from "react"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BuildingList } from "@/components/building-list"
import { BuildingDetail } from "@/components/building-detail"

// Datos de ejemplo de edificios
const edificiosEjemplo = [
  {
    id: 1,
    nombre: "Edificio Mirador",
    direccion: "Av. Principal 123",
    permalink: "edificio-mirador",
    politica_mascotas: "Se permiten mascotas pequeñas",
    tipo_estacionamiento: "Cochera cubierta",
    url_imagen_principal:
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_31_32.png?updatedAt=1748864528746",
    fecha_creacion: "2024-01-15",
    departamentos_count: 12,
    disponibles_count: 8,
  },
  {
    id: 2,
    nombre: "Torre del Sol",
    direccion: "Calle Secundaria 456",
    permalink: "torre-del-sol",
    politica_mascotas: "No se permiten mascotas",
    tipo_estacionamiento: "Garage",
    url_imagen_principal:
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_34_51.png?updatedAt=1748864665156",
    fecha_creacion: "2024-02-20",
    departamentos_count: 8,
    disponibles_count: 3,
  },
]

export default function BackOfficePage() {
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)

  const handleBuildingSelect = (buildingId: number) => {
    setSelectedBuilding(buildingId)
  }

  const handleBackToList = () => {
    setSelectedBuilding(null)
  }

  const selectedBuildingData = edificiosEjemplo.find((b) => b.id === selectedBuilding)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HomEstate</h1>
              <p className="text-sm text-gray-600">Panel de Administración</p>
            </div>
          </div>
          {selectedBuilding && (
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Edificios
            </Button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedBuilding ? (
          <BuildingDetail building={selectedBuildingData!} onBack={handleBackToList} />
        ) : (
          <BuildingList buildings={edificiosEjemplo} onSelectBuilding={handleBuildingSelect} />
        )}
      </div>
    </div>
  )
}
