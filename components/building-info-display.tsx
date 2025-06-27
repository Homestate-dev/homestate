import { Users, Check, Shield, Car } from "lucide-react"

interface BuildingInfoDisplayProps {
  building: {
    id: number
    nombre: string
    direccion: string
    areas_comunales?: string[]
    seguridad?: string[]
    aparcamiento?: string[]
  }
}

export function BuildingInfoDisplay({ building }: BuildingInfoDisplayProps) {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Información del edificio</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Áreas comunales */}
            {building.areas_comunales && building.areas_comunales.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  Áreas comunales
                </h4>
                <ul className="space-y-1">
                  {building.areas_comunales.map((area, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seguridad */}
            {building.seguridad && building.seguridad.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Seguridad
                </h4>
                <div className="space-y-1">
                  {building.seguridad.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600 flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Estacionamiento */}
            {building.aparcamiento && building.aparcamiento.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-orange-600" />
                  Estacionamiento
                </h4>
                <div className="space-y-1">
                  {building.aparcamiento.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600 flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 