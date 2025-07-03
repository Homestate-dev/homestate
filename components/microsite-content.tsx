"use client"

import { useState, useEffect, useMemo } from 'react'
import { BuildingImagesCarousel } from '@/components/building-images-carousel'
import { BuildingInfoDisplay } from '@/components/building-info-display'
import { DepartmentCard } from '@/components/department-card'
import { MicrositeFilterBar, FilterState } from '@/components/microsite-filter-bar'
import { MicrositeShareButton } from '@/components/microsite-share-button'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, MapPin, DollarSign, Users } from 'lucide-react'

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

interface MicrositeContentProps {
  building: Building
  departments: Department[]
}

export function MicrositeContent({ building, departments }: MicrositeContentProps) {
  const [mounted, setMounted] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])

  // Manejar hidratación
  useEffect(() => {
    setMounted(true)
    // Inicializar departamentos filtrados
    if (Array.isArray(departments) && departments.length > 0) {
      setFilteredDepartments(departments)
    }
  }, [departments])

  // Si no está montado (hidratación), mostrar loading
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Validar datos después del montaje con verificaciones más defensivas
  if (!building || typeof building !== 'object' || !building.nombre || typeof building.nombre !== 'string') {
    console.error('Building data validation failed:', { building, departments })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h1 className="text-xl font-bold mb-2">Error al cargar el edificio</h1>
            <p>Los datos del edificio no están disponibles o son inválidos</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Validar departments es un array
  const validDepartments = Array.isArray(departments) ? departments : []

  // Preparar todas las imágenes del edificio
  const buildingImages = useMemo(() => {
    // Validar que building existe antes de acceder a sus propiedades
    if (!building || typeof building !== 'object') {
      return []
    }
    
    const images = []
    if (building.url_imagen_principal && typeof building.url_imagen_principal === 'string') {
      images.push(building.url_imagen_principal)
    }
    if (Array.isArray(building.imagenes_secundarias) && building.imagenes_secundarias.length > 0) {
      images.push(...building.imagenes_secundarias.filter(img => typeof img === 'string'))
    }
    return images
  }, [building?.url_imagen_principal, building?.imagenes_secundarias])

  // Función para aplicar filtros
  const applyFilters = (filters: FilterState) => {
    let filtered = [...validDepartments]

    // Filtrar por tipo de operación
    if (filters.tipo !== "todos") {
      filtered = filtered.filter(dept => {
        if (filters.tipo === "venta") {
          return dept.valor_venta && dept.valor_venta > 0
        }
        if (filters.tipo === "arriendo") {
          return dept.valor_arriendo && dept.valor_arriendo > 0
        }
        if (filters.tipo === "arriendo y venta") {
          return (dept.valor_venta && dept.valor_venta > 0) && (dept.valor_arriendo && dept.valor_arriendo > 0)
        }
        return true
      })
    }

    // Filtrar por habitaciones
    if (filters.habitaciones !== "todas") {
      filtered = filtered.filter(dept => dept.cantidad_habitaciones === filters.habitaciones)
    }

    // Filtrar por estado
    if (filters.estado !== "todos") {
      filtered = filtered.filter(dept => dept.estado === filters.estado)
    }

    // Filtrar por ideal para
    if (filters.idealPara !== "todos") {
      filtered = filtered.filter(dept => dept.ideal_para === filters.idealPara)
    }

    // Filtrar por precio
    filtered = filtered.filter(dept => {
      const precio = dept.valor_venta || dept.valor_arriendo || 0
      return precio >= filters.priceRange[0] && precio <= filters.priceRange[1]
    })

    // Filtrar por área
    filtered = filtered.filter(dept => {
      return dept.area >= filters.areaRange[0] && dept.area <= filters.areaRange[1]
    })

    // Filtrar por características
    if (filters.characteristics.amueblado) {
      filtered = filtered.filter(dept => dept.amueblado)
    }
    if (filters.characteristics.livingComedor) {
      filtered = filtered.filter(dept => dept.tiene_living_comedor)
    }
    if (filters.characteristics.cocinaSeparada) {
      filtered = filtered.filter(dept => dept.tiene_cocina_separada)
    }
    if (filters.characteristics.banoCompleto) {
      filtered = filtered.filter(dept => dept.tiene_bano_completo)
    }
    if (filters.characteristics.aireAcondicionado) {
      filtered = filtered.filter(dept => dept.tiene_aire_acondicionado)
    }
    if (filters.characteristics.placares) {
      filtered = filtered.filter(dept => dept.tiene_placares)
    }

    setFilteredDepartments(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al listado
              </Button>
            </Link>
            <MicrositeShareButton 
              buildingName={building.nombre}
              permalink={building.permalink}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del edificio */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Carrusel de imágenes */}
            <div>
              <BuildingImagesCarousel images={buildingImages} buildingName={building.nombre} />
            </div>
            
            {/* Información del edificio */}
            <div>
              <BuildingInfoDisplay building={building} />
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Departamentos</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Badge className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.filter(d => d.disponible).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expensas</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${building.costo_expensas?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ubicación</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {building.direccion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
          <MicrositeFilterBar 
            departments={departments}
            onFiltersChange={applyFilters}
          />
        </div>

        {/* Listado de departamentos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Departamentos Disponibles
            </h2>
            <Badge variant="secondary">
              {filteredDepartments.length} de {departments.length} departamentos
            </Badge>
          </div>
          
          {filteredDepartments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">
                No se encontraron departamentos que coincidan con los filtros seleccionados.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => applyFilters({
                  tipo: "todos",
                  habitaciones: "todas",
                  estado: "todos",
                  idealPara: "todos",
                  priceRange: [0, 10000000],
                  areaRange: [0, 500],
                  characteristics: {
                    amueblado: false,
                    livingComedor: false,
                    cocinaSeparada: false,
                    banoCompleto: false,
                    aireAcondicionado: false,
                    placares: false
                  }
                })}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDepartments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  buildingName={building.nombre}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}