"use client"

import { useState } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FilterBar() {
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [areaRange, setAreaRange] = useState([0, 200])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-orange-600" />
          Filtros inteligentes
        </h2>
        <Button variant="outline" size="sm">
          Limpiar filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de operación</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="venta">Venta</SelectItem>
              <SelectItem value="arriendo">Arriendo</SelectItem>
              <SelectItem value="ambos">Venta y arriendo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Habitaciones</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="loft">Loft</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="dos">2 habitaciones</SelectItem>
              <SelectItem value="tres">3 habitaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de departamento</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="piso">Piso</SelectItem>
              <SelectItem value="duplex">Dúplex</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="estudio">Estudio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="nuevo">Nuevo</SelectItem>
              <SelectItem value="poco_uso">Poco uso</SelectItem>
              <SelectItem value="un_ano">Un año</SelectItem>
              <SelectItem value="mas_de_un_ano">Más de un año</SelectItem>
              <SelectItem value="remodelar">Remodelar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Rango de precio (USD): ${priceRange[0]} - ${priceRange[1]}
          </label>
          <Slider defaultValue={[0, 200000]} max={200000} step={5000} onValueChange={setPriceRange} className="py-4" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Área (m²): {areaRange[0]} - {areaRange[1]}
          </label>
          <Slider defaultValue={[0, 200]} max={200} step={5} onValueChange={setAreaRange} className="py-4" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              Características
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Características</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem>Amoblado</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Sala comedor</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Cocina separada</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Antebaño</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Baño completo</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Aire acondicionado</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Closets</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              Ideal para
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Ideal para</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem>Familia</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Pareja</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Soltero</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Estudiantes</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Inversión</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              Piso
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Piso</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem>Planta baja</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>1er piso</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>2do piso</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>3er piso</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>4to piso o superior</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 flex justify-center">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8">Aplicar filtros</Button>
      </div>
    </div>
  )
}
