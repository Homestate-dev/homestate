"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Department {
  id: number
  numero: string
  nombre: string
  piso: number
  area: number
  valor_arriendo: number | null
  valor_venta: number | null
  alicuota: number | null
  incluye_alicuota: boolean | null
  disponible: boolean
  amueblado: boolean
  cantidad_habitaciones: string
  tipo: string
  estado: string
  ideal_para: string
  tiene_living_comedor: boolean
  tiene_cocina_separada: boolean
  tiene_bano_completo: boolean
  tiene_aire_acondicionado: boolean
  tiene_placares: boolean
  tiene_cocina_con_horno_y_anafe: boolean
  tiene_muebles_bajo_mesada: boolean
  tiene_desayunador_madera: boolean
  imagenes: string[]
}

interface DepartmentCardProps {
  department: Department
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === department.imagenes.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev === 0 ? department.imagenes.length - 1 : prev - 1))
  }

  // Traducir cantidad de habitaciones
  const habitacionesMap: Record<string, string> = {
    'Loft': "Loft",
    'Suite': "Suite", 
    '2': "2 hab",
    '3': "3 hab",
    '4': "4 hab",
    '5': "5+ hab"
  }

  // Traducir tipo de departamento
  const tipoMap: Record<string, string> = {
    'arriendo': "Arriendo",
    'venta': "Venta",
    'arriendo y venta': "Arriendo y Venta"
  }

  // Traducir estado
  const estadoMap: Record<string, string> = {
    'nuevo': "Nuevo",
    'poco_uso': "Poco uso",
    'un_ano': "Un año",
    'mas_de_un_ano': "Más de un año",
    'remodelar': "Para remodelar"
  }

  const displayImages = department.imagenes.length > 0 ? department.imagenes : ["/placeholder.svg"]

  return (
    <Link href={`/departamento/${department.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-[500px] flex flex-col cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={displayImages[currentImageIndex]}
            alt={department.nombre}
            fill
            className="object-cover"
          />
          {department.imagenes.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white rounded-full h-8 w-8"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Badges de disponibilidad y tipo */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant={department.disponible ? "default" : "secondary"} className="text-xs">
              {department.disponible ? "Disponible" : "No disponible"}
            </Badge>
            {department.amueblado && (
              <Badge variant="outline" className="text-xs bg-white/90">
                Amueblado
              </Badge>
            )}
          </div>

          {/* Indicadores de imagen */}
          {department.imagenes.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {department.imagenes.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? "bg-orange-600" : "bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{department.nombre}</CardTitle>
            <Badge variant="outline" className="text-xs">
              Piso {department.piso}
            </Badge>
          </div>
          <CardDescription className="text-sm">
            Depto {department.numero} • {estadoMap[department.estado] || department.estado}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          {/* Precios */}
          <div className="mb-4 space-y-1">
            {department.valor_venta && department.valor_venta > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700">Venta</span>
                <span className="text-lg font-bold text-green-600">
                  ${department.valor_venta.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${(department.valor_venta * 1.25).toLocaleString()}
                </span>
              </div>
            ) : null}

            {department.valor_arriendo && department.valor_arriendo > 0 ? (
              <div className="flex flex-col">
                {(() => {
                  const incluye = department.incluye_alicuota ?? false
                  const base = department.valor_arriendo || 0
                  const alicuota = department.alicuota || 0
                  const total = incluye ? base + alicuota : base
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700">Arriendo</span>
                      <span className="text-sm text-blue-600">
                        ${total.toLocaleString()}/mes
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        ${(total * 1.25).toLocaleString()}/mes
                      </span>
                    </div>
                  )
                })()}
                <span className="text-xs text-gray-500">
                  {department.incluye_alicuota ? 'Incluye alícuota' : 'No incluye alícuota'}
                </span>
              </div>
            ) : null}
          </div>

          {/* Características principales */}
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="flex flex-col items-center">
              <Bed className="h-4 w-4 text-orange-600 mb-1" />
              <span className="text-xs">{habitacionesMap[department.cantidad_habitaciones] || department.cantidad_habitaciones}</span>
            </div>
            <div className="flex flex-col items-center">
              <Bath className="h-4 w-4 text-orange-600 mb-1" />
              <span className="text-xs">{department.tiene_bano_completo ? "1 Baño" : "Sin baño"}</span>
            </div>
            <div className="flex flex-col items-center">
              <Maximize className="h-4 w-4 text-orange-600 mb-1" />
              <span className="text-xs">{department.area} m²</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="sm">
            Ver detalles
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
} 