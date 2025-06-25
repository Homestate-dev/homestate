"use client"
import { useState } from "react"
import { Building2, ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BuildingList } from "@/components/building-list"
import { BuildingDetail } from "@/components/building-detail"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import type { Building } from "@/types/building"

// Datos de ejemplo de edificios
const edificiosEjemplo: Building[] = [
  {
    id: 1,
    nombre: "Edificio Mirador",
    direccion: "Av. Principal 123",
    ciudad: "Santiago",
    pais: "Chile",
    codigo_postal: "8320000",
    telefono: "+56 2 2345 6789",
    email: "info@edificiomirador.cl",
    sitio_web: "https://edificiomirador.cl",
    descripcion: "Edificio residencial con vista panorámica",
    fecha_construccion: "2020",
    pisos: 15,
    departamentos_totales: 12,
    departamentos_disponibles: 8,
    departamentos_ocupados: 3,
    departamentos_reservados: 1,
    departamentos_mantenimiento: 0,
    amenidades: ["Piscina", "Gimnasio", "Sala de eventos"],
    imagenes: ["https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_31_32.png?updatedAt=1748864528746"],
    estado: "activo",
    fecha_creacion: "2024-01-15",
    fecha_actualizacion: "2024-01-15",
    permalink: "edificio-mirador",
    politica_mascotas: "Se permiten mascotas pequeñas",
    tipo_estacionamiento: "Cochera cubierta",
    url_imagen_principal: "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_31_32.png?updatedAt=1748864528746",
    departamentos_count: 12,
    disponibles_count: 8,
  },
  {
    id: 2,
    nombre: "Torre del Sol",
    direccion: "Calle Secundaria 456",
    ciudad: "Santiago",
    pais: "Chile",
    codigo_postal: "8320001",
    telefono: "+56 2 2345 6790",
    email: "info@torredelsol.cl",
    sitio_web: "https://torredelsol.cl",
    descripcion: "Torre residencial moderna",
    fecha_construccion: "2021",
    pisos: 12,
    departamentos_totales: 8,
    departamentos_disponibles: 3,
    departamentos_ocupados: 4,
    departamentos_reservados: 1,
    departamentos_mantenimiento: 0,
    amenidades: ["Terraza", "Sala de estudio", "Bicicletero"],
    imagenes: ["https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_34_51.png?updatedAt=1748864665156"],
    estado: "activo",
    fecha_creacion: "2024-02-20",
    fecha_actualizacion: "2024-02-20",
    permalink: "torre-del-sol",
    politica_mascotas: "No se permiten mascotas",
    tipo_estacionamiento: "Garage",
    url_imagen_principal: "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_34_51.png?updatedAt=1748864665156",
    departamentos_count: 8,
    disponibles_count: 3,
  },
]

export default function BackOfficePage() {
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)
  const { isAuthenticated, login, logout } = useAuth()

  const handleBuildingSelect = (buildingId: number) => {
    setSelectedBuilding(buildingId)
  }

  const handleBackToList = () => {
    setSelectedBuilding(null)
  }

  const selectedBuildingData = edificiosEjemplo.find((b) => b.id === selectedBuilding)

  // Si no está autenticado, mostrar el formulario de login
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />
  }

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
          <div className="flex items-center gap-3">
            {selectedBuilding && (
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Edificios
              </Button>
            )}
            <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedBuilding ? (
          <BuildingDetail building={selectedBuildingData!} />
        ) : (
          <BuildingList buildings={edificiosEjemplo} onSelectBuilding={handleBuildingSelect} />
        )}
      </div>
    </div>
  )
}
