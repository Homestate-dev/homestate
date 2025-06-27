"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface FilterState {
  tipo: string
  habitaciones: string
  estado: string
  idealPara: string
  priceRange: number[]
  areaRange: number[]
  characteristics: {
    amueblado: boolean
    livingComedor: boolean
    cocinaSeparada: boolean
    banoCompleto: boolean
    aireAcondicionado: boolean
    placares: boolean
  }
}

interface MicrositeFilterBarProps {
  onFiltersChange: (filters: FilterState) => void
  departmentsCount: number
}

export function MicrositeFilterBar({ onFiltersChange, departmentsCount }: MicrositeFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    tipo: "todos",
    habitaciones: "todas",
    estado: "todos",
    idealPara: "todos",
    priceRange: [0, 500000],
    areaRange: [0, 200],
    characteristics: {
      amueblado: false,
      livingComedor: false,
      cocinaSeparada: false,
      banoCompleto: false,
      aireAcondicionado: false,
      placares: false
    }
  })

  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCharacteristicChange = (key: keyof FilterState['characteristics'], checked: boolean) => {
    const newCharacteristics = { ...filters.characteristics, [key]: checked }
    const newFilters = { ...filters, characteristics: newCharacteristics }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      tipo: "todos",
      habitaciones: "todas",
      estado: "todos",
      idealPara: "todos",
      priceRange: [0, 500000],
      areaRange: [0, 200],
      characteristics: {
        amueblado: false,
        livingComedor: false,
        cocinaSeparada: false,
        banoCompleto: false,
        aireAcondicionado: false,
        placares: false
      }
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = 
    filters.tipo !== "todos" || 
    filters.habitaciones !== "todas" || 
    filters.estado !== "todos" || 
    filters.idealPara !== "todos" ||
    Object.values(filters.characteristics).some(val => val)

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-2 transition-colors px-6 py-3 text-base font-medium min-w-[200px] ${
                hasActiveFilters 
                  ? "border-orange-600 text-orange-600 bg-orange-50 hover:bg-orange-100" 
                  : "border-orange-600 text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtros inteligentes
              {hasActiveFilters && (
                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  Activos
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white rounded-lg p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-orange-600 text-xl">Filtros inteligentes</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de operación</label>
                <Select value={filters.tipo} onValueChange={(value) => handleFilterChange('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="arriendo">Arriendo</SelectItem>
                    <SelectItem value="arriendo y venta">Venta y Arriendo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Habitaciones</label>
                <Select value={filters.habitaciones} onValueChange={(value) => handleFilterChange('habitaciones', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="Loft">Loft</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="2">2 habitaciones</SelectItem>
                    <SelectItem value="3">3 habitaciones</SelectItem>
                    <SelectItem value="4">4+ habitaciones</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                <Select value={filters.estado} onValueChange={(value) => handleFilterChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="poco_uso">Poco uso</SelectItem>
                    <SelectItem value="un_ano">Un año</SelectItem>
                    <SelectItem value="mas_de_un_ano">Más de un año</SelectItem>
                    <SelectItem value="remodelar">Para remodelar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ideal para</label>
                <Select value={filters.idealPara} onValueChange={(value) => handleFilterChange('idealPara', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="familia">Familia</SelectItem>
                    <SelectItem value="pareja">Pareja</SelectItem>
                    <SelectItem value="persona_sola">Una persona</SelectItem>
                    <SelectItem value="profesional">Profesional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Rango de precio (USD): ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={500000}
                  step={10000}
                  className="py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Área (m²): {filters.areaRange[0]} - {filters.areaRange[1]}
                </label>
                <Slider 
                  value={filters.areaRange}
                  onValueChange={(value) => handleFilterChange('areaRange', value)}
                  max={200} 
                  step={5} 
                  className="py-2" 
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Características</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.characteristics.amueblado}
                    onChange={(e) => handleCharacteristicChange('amueblado', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Amueblado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.characteristics.livingComedor}
                    onChange={(e) => handleCharacteristicChange('livingComedor', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Sala comedor</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.characteristics.cocinaSeparada}
                    onChange={(e) => handleCharacteristicChange('cocinaSeparada', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Cocina separada</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.characteristics.banoCompleto}
                    onChange={(e) => handleCharacteristicChange('banoCompleto', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Baño completo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.characteristics.aireAcondicionado}
                    onChange={(e) => handleCharacteristicChange('aireAcondicionado', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Aire acondicionado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.characteristics.placares}
                    onChange={(e) => handleCharacteristicChange('placares', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Placares</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="px-6 py-2"
              >
                Limpiar filtros
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full shadow"
                onClick={() => setIsOpen(false)}
              >
                Aplicar filtros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-gray-600">
        {departmentsCount} departamento{departmentsCount !== 1 ? 's' : ''} disponible{departmentsCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export type { FilterState } 