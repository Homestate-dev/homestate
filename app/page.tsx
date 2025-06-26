"use client"
import { useState, useEffect } from "react"
import { Building2, ArrowLeft, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BuildingList } from "@/components/building-list"
import { BuildingDetail } from "@/components/building-detail"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/contexts/auth-context"
import { DatabaseStatus } from "@/components/database-status"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

interface Building {
  id: number
  nombre: string
  direccion: string
  permalink: string
  costo_expensas: number
  areas_comunales: string[]
  seguridad: string[]
  aparcamiento: string[]
  url_imagen_principal: string
  imagenes_secundarias: string[]
  fecha_creacion: string
  departamentos_count: number
  disponibles_count: number
}

export default function BackOfficePage() {
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>("apartments")
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loadingBuildings, setLoadingBuildings] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, login, logout, loading } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isAuthenticated) {
      fetchBuildings()
    }
  }, [isAuthenticated])

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true)
      const response = await fetch('/api/buildings')
      const data = await response.json()
      
      if (data.success) {
        setBuildings(data.data)
      } else {
        toast.error('Error al cargar edificios')
      }
    } catch (error) {
      console.error('Error al obtener edificios:', error)
      toast.error('Error al cargar edificios')
    } finally {
      setLoadingBuildings(false)
    }
  }

  const handleBuildingSelect = (buildingId: number, initialTab: string = "apartments") => {
    setSelectedBuilding(buildingId)
    setSelectedTab(initialTab)
  }

  const handleBackToList = () => {
    setSelectedBuilding(null)
    setSelectedTab("apartments")
  }

  const selectedBuildingData = buildings.find((b) => b.id === selectedBuilding)

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar el formulario de login
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header */}
          {isMobile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-orange-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">HomEstate</h1>
                    <p className="text-xs text-gray-600">Panel Admin</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <DatabaseStatus />
                  
                  {user && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-gray-600">Administrador</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    {selectedBuilding && (
                      <Button variant="outline" size="sm" onClick={handleBackToList} className="justify-start">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Edificios
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={logout} className="text-red-600 hover:text-red-700 justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Header */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-orange-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">HomEstate</h1>
                  <p className="text-sm text-gray-600">Panel de Administración</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <DatabaseStatus />
                
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-gray-600">Administrador</p>
                    </div>
                  </div>
                )}
                
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
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {loadingBuildings ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Cargando edificios...</p>
          </div>
        ) : selectedBuilding ? (
          <BuildingDetail building={selectedBuildingData!} initialTab={selectedTab} />
        ) : (
          <BuildingList 
            buildings={buildings} 
            onSelectBuilding={handleBuildingSelect}
            onBuildingCreated={fetchBuildings}
          />
        )}
      </div>
    </div>
  )
}
