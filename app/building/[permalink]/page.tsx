import { notFound } from 'next/navigation'
import { executeQuery } from '@/lib/database'
import Image from 'next/image'

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
      areas_comunales: building.areas_comunales ? JSON.parse(building.areas_comunales) : [],
      seguridad: building.seguridad ? JSON.parse(building.seguridad) : [],
      aparcamiento: building.aparcamiento ? JSON.parse(building.aparcamiento) : [],
      imagenes_secundarias: building.imagenes_secundarias ? JSON.parse(building.imagenes_secundarias) : []
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
            Micrositio del edificio {building.nombre} en producción
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Permalink: {building.permalink} | HomEstate
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Nombre del edificio */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {building.nombre}
          </h2>
          <p className="text-gray-600">
            {building.direccion}
          </p>
        </div>

        {/* Imagen principal */}
        {building.url_imagen_principal && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Imagen Principal
            </h3>
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={building.url_imagen_principal}
                alt={`Imagen principal de ${building.nombre}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Imágenes secundarias */}
        {building.imagenes_secundarias.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Imágenes Secundarias ({building.imagenes_secundarias.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {building.imagenes_secundarias.map((imageUrl, index) => (
                <div key={index} className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Imagen ${index + 1} de ${building.nombre}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer simple */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Micrositio generado por HomEstate | {new Date().getFullYear()}
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