"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApartmentCard } from "@/components/apartment-card"
import { Users, Check, Shield, Car } from "lucide-react"

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

interface Edificio {
  id: number
  nombre: string
  direccion: string
  descripcion: string
  imagenes: string[]
  areas_comunales?: string[]
  seguridad?: {
    tipo: string
    camaras: boolean
    acceso_controlado: boolean
    intercomunicador: boolean
    alarma: boolean
  }
  aparcamiento?: {
    tipo: string
    espacios_totales: number
    espacios_visitantes: number
    acceso_automatico: boolean
    vigilancia: boolean
  }
  departamentos: Departamento[]
}

interface BuildingProps {
  edificio: Edificio
}

export function Building({ edificio }: BuildingProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === edificio.imagenes.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? edificio.imagenes.length - 1 : prev - 1))
  }

  return (
    <div className="mb-12">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
        <div className="p-6">
          
       
         

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Áreas comunales */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Áreas comunales
              </h4>
              <ul className="space-y-1">
                {edificio.areas_comunales?.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Seguridad */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-orange-600" />
                Seguridad
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  {edificio.seguridad?.tipo}
                </p>
                {edificio.seguridad?.camaras && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Cámaras de seguridad
                  </p>
                )}
                {edificio.seguridad?.acceso_controlado && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Acceso controlado
                  </p>
                )}
                {edificio.seguridad?.intercomunicador && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Intercomunicador
                  </p>
                )}
                {edificio.seguridad?.alarma && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Sistema de alarma
                  </p>
                )}
              </div>
            </div>

            {/* Aparcamiento */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Car className="h-5 w-5 mr-2 text-orange-600" />
                Aparcamiento
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{edificio.aparcamiento?.tipo}</p>
                <p className="text-sm text-gray-600">{edificio.aparcamiento?.espacios_totales} espacios totales</p>
                <p className="text-sm text-gray-600">
                  {edificio.aparcamiento?.espacios_visitantes} espacios para visitantes
                </p>
                {edificio.aparcamiento?.acceso_automatico && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Acceso automático
                  </p>
                )}
                {edificio.aparcamiento?.vigilancia && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Vigilancia 24/7
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-[400px] w-full">
          <Image
            src={edificio.imagenes[currentImageIndex] || "/placeholder.svg"}
            alt={`${edificio.nombre} - Imagen ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Imagen anterior</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Siguiente imagen</span>
            </Button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {edificio.imagenes.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-orange-600" : "bg-white/70"}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <span className="sr-only">Imagen {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Departamentos ({edificio.departamentos.filter((d) => d.disponible).length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edificio.departamentos.map((departamento) => (
            <ApartmentCard key={departamento.id} departamento={departamento} />
          ))}
        </div>
      </div>
    </div>
  )
}
