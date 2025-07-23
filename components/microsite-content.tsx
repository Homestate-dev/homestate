"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { BuildingImagesCarousel } from '@/components/building-images-carousel'
import { BuildingInfoDisplay } from '@/components/building-info-display'
import { DepartmentCard } from '@/components/department-card'
import { MicrositeFilterBar, FilterState } from '@/components/microsite-filter-bar'
import { MicrositeShareButton } from '@/components/microsite-share-button'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Eye } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
// Componentes temporalmente comentados para debug
// import { DebugRerenderDetector } from '@/components/debug-rerender-detector'
// import { ProductionErrorBoundary } from '@/components/production-error-boundary'
import { Header } from '@/components/header'

interface Department {
  id: number
  numero: string
  nombre: string
  piso: number
  area_total: number
  area_cubierta?: number
  area_descubierta?: number
  cantidad_banos?: number
  valor_arriendo: number | null
  valor_venta: number | null
  alicuota?: number
  incluye_alicuota?: boolean
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
  tiene_bodega?: boolean
  ambientes_y_adicionales?: string[]
  videos_url?: string[]
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
  descripcion?: string // Added descripcion field
}

interface MicrositeContentProps {
  building: Building
  departments: Department[]
}

export function MicrositeContent({ building, departments }: MicrositeContentProps) {
  const [mounted, setMounted] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  
  // Detectar re-renders infinitos
  const renderCountRef = useRef(0)
  const lastResetRef = useRef(Date.now())
  const buildingImagesRef = useRef<string[]>([])
  
  renderCountRef.current += 1
  
  // Resetear contador cada 2 segundos
  const now = Date.now()
  if (now - lastResetRef.current > 2000) {
    renderCountRef.current = 1
    lastResetRef.current = now
  }
  
  // Detectar posible ciclo infinito
  if (renderCountRef.current > 50) {
    console.error(`⚠️ INFINITE RENDER DETECTED: MicrositeContent rendered ${renderCountRef.current} times`)
    console.error('Building:', building?.nombre)
    console.error('Departments count:', departments?.length)
    
    // En desarrollo, mostrar alerta
    if (process.env.NODE_ENV === 'development') {
      console.trace('Render trace:')
    }
    
    // Prevenir más renders devolviendo un estado estático
    if (renderCountRef.current > 100) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h1 className="text-xl font-bold mb-2">Error de renderizado detectado</h1>
              <p>El componente está en un ciclo infinito de re-renders. Recarga la página para intentar de nuevo.</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
  }

  // Manejar hidratación
  useEffect(() => {
    setMounted(true)
    // Inicializar departamentos filtrados SOLO con los disponibles
    if (Array.isArray(departments) && departments.length > 0) {
      setFilteredDepartments(departments.filter(d => d.disponible))
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

  // Preparar todas las imágenes del edificio con approach más estable
  // Usar ref para mantener referencia estable y evitar ciclos infinitos
  const getBuildingImages = () => {
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
  }
  
  // Usar técnica más estable para las imágenes
  const currentImages = getBuildingImages()
  const buildingImages = (() => {
    // Solo actualizar la ref si las imágenes han cambiado realmente
    const newImagesStr = JSON.stringify(currentImages)
    const oldImagesStr = JSON.stringify(buildingImagesRef.current)
    
    if (newImagesStr !== oldImagesStr) {
      buildingImagesRef.current = currentImages
    }
    
    return buildingImagesRef.current
  })()

  // Función para detectar si los filtros están limpios (valores por defecto)
  const areFiltersClean = (filters: FilterState) => {
    return (
      filters.tipo === "todos" &&
      filters.habitaciones === "todas" &&
      filters.estado === "todos" &&
      filters.idealPara === "todos" &&
      filters.priceRange[0] === 0 && filters.priceRange[1] === 500000 &&
      filters.rentRange[0] === 0 && filters.rentRange[1] === 5000 &&
      filters.areaRange[0] === 0 && filters.areaRange[1] === 200
    )
  }

  // Función para aplicar filtros
  const applyFilters = (filters: FilterState) => {
    console.log('🔍 Aplicando filtros:', filters)
    console.log('📊 Departamentos disponibles antes de filtrar:', validDepartments.filter(dept => dept.disponible).length)
    console.log('🧹 Filtros están limpios:', areFiltersClean(filters))
    
    let filtered = [...validDepartments].filter(dept => dept.disponible)

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

    // Solo aplicar filtros de rango si los filtros no están limpios
    if (!areFiltersClean(filters)) {
      // Filtrar por precio de venta (solo si el usuario ha modificado el rango)
      const isPriceRangeModified = filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500000
      console.log('💰 Filtro precio venta modificado:', isPriceRangeModified, 'Rango:', filters.priceRange)
      if (isPriceRangeModified) {
        const beforeCount = filtered.length
        filtered = filtered.filter(dept => {
          const precioVenta = dept.valor_venta || 0
          return precioVenta >= filters.priceRange[0] && precioVenta <= filters.priceRange[1]
        })
        console.log('💰 Departamentos después filtro venta:', filtered.length, 'de', beforeCount)
      }

      // Filtrar por precio de arriendo (solo si el usuario ha modificado el rango)
      const isRentRangeModified = filters.rentRange[0] !== 0 || filters.rentRange[1] !== 5000
      console.log('🏠 Filtro precio arriendo modificado:', isRentRangeModified, 'Rango:', filters.rentRange)
      if (isRentRangeModified) {
        const beforeCount = filtered.length
        filtered = filtered.filter(dept => {
          const precioArriendo = dept.valor_arriendo || 0
          return precioArriendo >= filters.rentRange[0] && precioArriendo <= filters.rentRange[1]
        })
        console.log('🏠 Departamentos después filtro arriendo:', filtered.length, 'de', beforeCount)
      }

      // Filtrar por área (solo si el usuario ha modificado el rango)
      const isAreaRangeModified = filters.areaRange[0] !== 0 || filters.areaRange[1] !== 200
      console.log('📏 Filtro área modificado:', isAreaRangeModified, 'Rango:', filters.areaRange)
      if (isAreaRangeModified) {
        const beforeCount = filtered.length
        filtered = filtered.filter(dept => {
          return dept.area_total >= filters.areaRange[0] && dept.area_total <= filters.areaRange[1]
        })
        console.log('📏 Departamentos después filtro área:', filtered.length, 'de', beforeCount)
      }
    } else {
      console.log('🧹 Filtros limpios - no aplicando filtros de rango')
    }

    console.log('✅ Departamentos después del filtrado:', filtered.length)
    console.log('📋 IDs de departamentos filtrados:', filtered.map(d => d.id))
    setFilteredDepartments(filtered)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        {/* Hero Section con imagen principal */}
        <section className="relative h-96 bg-orange-600 overflow-hidden">
          {/* Fondo naranja sólido, sin imagen */}
          <div className="absolute inset-0 bg-orange-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{building.nombre}</h1>
              <p className="text-xl md:text-2xl mb-6 flex items-center justify-center">
                <MapPin className="h-6 w-6 mr-2" />
                {building.direccion}
              </p>
              {building.descripcion && (
                <p className="text-white italic text-lg md:text-xl mb-4">{building.descripcion}</p>
              )}
              <MicrositeShareButton buildingName={building.nombre} buildingAddress={building.direccion} />
            </div>
          </div>
        </section>

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
                  <Eye className="h-6 w-6 text-green-600" />
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
              departmentsCount={departments.length}
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
                    priceRange: [0, 500000],
                    rentRange: [0, 5000],
                    areaRange: [0, 200]
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