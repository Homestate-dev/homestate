import { notFound } from 'next/navigation'
import { executeQuery } from '@/lib/database'
import Image from 'next/image'

function safeJsonParse(jsonString: string | any[] | null, defaultValue: any = null) {
  if (!jsonString) return defaultValue
  
  // Si ya es un array o objeto, devolverlo directamente
  if (Array.isArray(jsonString) || typeof jsonString === 'object') {
    return jsonString
  }
  
  // Solo intentar parsear si es un string
  if (typeof jsonString !== 'string') {
    return defaultValue
  }
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return defaultValue
  }
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

async function getBuildingByPermalink(permalink: string): Promise<Building | null> {
  try {
    const query = `
      SELECT 
        id,
        nombre,
        direccion,
        permalink,
        costo_expensas,
        areas_comunales,
        seguridad,
        aparcamiento,
        url_imagen_principal,
        imagenes_secundarias,
        fecha_creacion
      FROM edificios 
      WHERE permalink = $1
    `
    const result = await executeQuery(query, [permalink])
    
    if (result.rows.length === 0) return null
    
    const building = result.rows[0]
    return {
      ...building,
      areas_comunales: safeJsonParse(building.areas_comunales, []),
      seguridad: safeJsonParse(building.seguridad, []),
      aparcamiento: safeJsonParse(building.aparcamiento, []),
      imagenes_secundarias: safeJsonParse(building.imagenes_secundarias, [])
    }
  } catch (error) {
    console.error('Error fetching building by permalink:', error)
    return null
  }
}

export default async function BuildingMicrositePage({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  const building = await getBuildingByPermalink(params.permalink)

  if (!building) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header simple */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {building.nombre}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {building.direccion} | HomEstate
          </p>
        </div>
      </div>

     

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
         {/* Mensaje de desarrollo */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">
            🚧 ¡Estamos desarrollando el sector de micrositios!
          </h3>
          <p className="text-orange-700">
            Este micrositio está en desarrollo activo. Pronto tendrás acceso a más información 
            sobre departamentos disponibles, precios, y podrás consultar las visitas directamente desde aquí.
          </p>
        </div>

        {/* Información básica */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido a {building.nombre}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            📍 {building.direccion}
          </p>
          
          {building.costo_expensas > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800">
                <strong>Expensas:</strong> ${building.costo_expensas.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Imagen principal */}
        {building.url_imagen_principal && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Vista Principal
            </h3>
            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={building.url_imagen_principal}
                alt={`Vista principal de ${building.nombre}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Áreas comunales */}
        {building.areas_comunales.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏢 Áreas Comunales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {building.areas_comunales.map((area, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-green-800">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seguridad */}
        {building.seguridad.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔒 Seguridad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {building.seguridad.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-600 mr-2">🛡️</span>
                  <span className="text-blue-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estacionamiento */}
        {building.aparcamiento.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🚗 Estacionamiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {building.aparcamiento.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-purple-600 mr-2">🚙</span>
                  <span className="text-purple-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imágenes secundarias */}
        {building.imagenes_secundarias.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📸 Galería ({building.imagenes_secundarias.length} imágenes)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {building.imagenes_secundarias.map((imageUrl, index) => (
                <div key={index} className="relative w-full h-48 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={imageUrl}
                    alt={`Imagen ${index + 1} de ${building.nombre}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        

        {/* Footer simple */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Micrositio generado por <strong className="text-orange-600">HomEstate</strong> | {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Para más información, contacta con el administrador del edificio
          </p>
        </div>
      </div>
    </div>
  )
}

// Generar metadata dinámico para SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  const building = await getBuildingByPermalink(params.permalink)

  if (!building) {
    return {
      title: 'Edificio no encontrado - HomEstate',
    }
  }

  return {
    title: `${building.nombre} - HomEstate`,
    description: `Micrositio del edificio ${building.nombre} ubicado en ${building.direccion}`,
    openGraph: {
      title: `${building.nombre} - HomEstate`,
      description: `Micrositio del edificio ${building.nombre}`,
      images: building.url_imagen_principal ? [building.url_imagen_principal] : [],
    },
  }
} 