"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Bed, Bath, Maximize } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Departamento {
  id: number
  numero: string
  nombre: string
  piso: number
  area: number
  valor_arriendo: number | null
  valor_venta: number | null
  precio_area: number | null
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

interface ApartmentCardProps {
  departamento: Departamento
}

export function ApartmentCard({ departamento }: ApartmentCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === departamento.imagenes.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? departamento.imagenes.length - 1 : prev - 1))
  }

  // Traducir cantidad de habitaciones
  const habitacionesMap: Record<string, string> = {
    loft: "Loft",
    suite: "Suite",
    dos: "2",
    tres: "3",
  }

  // Traducir tipo de departamento
  const tipoMap: Record<string, string> = {
    piso: "Piso",
    duplex: "Dúplex",
    penthouse: "Penthouse",
    estudio: "Estudio",
  }

  // Traducir estado
  const estadoMap: Record<string, string> = {
    nuevo: "Nuevo",
    poco_uso: "Poco uso",
    un_ano: "Un año",
    mas_de_un_ano: "Más de un año",
    remodelar: "Remodelar",
  }

  // Traducir ideal para
  const idealParaMap: Record<string, string> = {
    familia: "Familia",
    pareja: "Pareja",
    soltero: "Soltero",
    estudiantes: "Estudiantes",
    inversion: "Inversión",
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={departamento.imagenes[currentImageIndex] || "/placeholder.svg"}
          alt={departamento.nombre}
          fill
          className="object-cover"
        />
        {departamento.imagenes.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 hover:bg-white rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Imagen anterior</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 hover:bg-white rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Siguiente imagen</span>
            </Button>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {departamento.valor_venta && <Badge className="bg-orange-600 hover:bg-orange-700">Venta</Badge>}
          {departamento.valor_arriendo && <Badge className="bg-blue-600 hover:bg-blue-700">Arriendo</Badge>}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{departamento.nombre}</CardTitle>
            <CardDescription>
              Piso {departamento.piso} · Depto {departamento.numero}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-800">
            {tipoMap[departamento.tipo]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{habitacionesMap[departamento.cantidad_habitaciones]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{departamento.tiene_bano_completo ? "1" : "0"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{departamento.area} m²</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {departamento.valor_venta && (
            <p className="font-semibold text-gray-900">Venta: ${departamento.valor_venta.toLocaleString()}</p>
          )}
          {departamento.valor_arriendo && (
            <p className="font-semibold text-gray-900">Arriendo: ${departamento.valor_arriendo.toLocaleString()}/mes</p>
          )}
          {departamento.precio_area && (
            <p className="text-sm text-gray-600">${departamento.precio_area.toLocaleString()}/m²</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {departamento.amueblado && (
            <Badge variant="secondary" className="text-xs">
              Amoblado
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {estadoMap[departamento.estado]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Para {idealParaMap[departamento.ideal_para]}
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
          <Link href={`/departamento/${departamento.id}`}>Ver detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
