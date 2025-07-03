import { useState, useEffect } from 'react'

interface Department {
  id: number
  numero: string
  nombre: string
  piso: number
  area: number
  valor_arriendo: number | null
  valor_venta: number | null
  disponible: boolean
  amueblado: boolean
  cantidad_habitaciones: string
  tipo: string
  estado: string
  ideal_para: string
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
}

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
}

interface BuildingData {
  building: Building
  departments: Department[]
}

export function useBuildingData(initialBuilding?: Building, initialDepartments?: Department[]) {
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Marcar como hidratado cuando el componente se monta en el cliente
    setIsHydrated(true)
    
    // Si tenemos datos iniciales, usarlos
    if (initialBuilding && initialBuilding.nombre && initialDepartments) {
      try {
        setBuildingData({
          building: initialBuilding,
          departments: initialDepartments
        })
        setIsLoading(false)
      } catch (err) {
        console.error('Error setting initial building data:', err)
        setError('Error al cargar datos del edificio')
        setIsLoading(false)
      }
    } else {
      setError('Datos del edificio no disponibles')
      setIsLoading(false)
    }
  }, [initialBuilding, initialDepartments])

  return {
    buildingData,
    isLoading,
    error,
    isHydrated
  }
} 