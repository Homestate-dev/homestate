"use client"

import { useState, useMemo } from 'react'
import { BuildingImagesCarousel } from '@/components/building-images-carousel'
import { BuildingInfoDisplay } from '@/components/building-info-display'
import { DepartmentCard } from '@/components/department-card'
import { MicrositeFilterBar, FilterState } from '@/components/microsite-filter-bar'
import { MicrositeShareButton } from '@/components/microsite-share-button'
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
  const [filteredDepartments, setFilteredDepartments] = useState(departments)

  // Preparar todas las imágenes del edificio
  const buildingImages = useMemo(() => {
    const images = []
    if (building.url_imagen_principal) {
      images.push(building.url_imagen_principal)
    }
    if (building.imagenes_secundarias && building.imagenes_secundarias.length > 0) {
      images.push(...building.imagenes_secundarias)
    }
    return images
  }, [building])

  // Función para aplicar filtros
  const applyFilters = (filters: FilterState) => {
    let filtered = [...departments]

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
      {/* Banner del micrositio */}
      <div className="bg-orange-500 text-white text-center py-8 px-4">
        <p className="text-lg mb-2">Bienvenido a</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Edificio {building.nombre}
        </h1>
        <p className="text-lg opacity-90 mb-1">
          {building.direccion}
        </p>
        <p className="text-base opacity-80">
          {departments.length} departamento{departments.length !== 1 ? 's' : ''} disponible{departments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Galería de imágenes del edificio */}
        <BuildingImagesCarousel images={buildingImages} buildingName={building.nombre} />

        {/* Información del edificio */}
        <BuildingInfoDisplay building={building} />

        {/* Sección de departamentos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Departamentos disponibles
            </h2>
            <MicrositeShareButton 
              buildingName={building.nombre} 
              buildingAddress={building.direccion}
            />
          </div>

          {/* Barra de filtros */}
          <MicrositeFilterBar 
            onFiltersChange={applyFilters} 
            departmentsCount={filteredDepartments.length}
          />

          {/* Grid de departamentos */}
          {filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDepartments.map((department) => (
                <DepartmentCard key={department.id} department={department} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron departamentos
                </h3>
                <p className="text-gray-600 mb-4">
                  No hay departamentos que coincidan con los filtros seleccionados.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilteredDepartments(departments)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer del micrositio */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Interesado en algún departamento?
            </h3>
            <p className="text-gray-600 mb-4">
              Contacta con nosotros para más información o para agendar una visita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Contactar por WhatsApp
              </Button>
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                Solicitar información
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 