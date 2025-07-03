import { notFound } from 'next/navigation'
import { getBuildingWithDepartmentsByPermalink } from '@/lib/database'
import { MicrositeContent } from '@/components/microsite-content'

export default async function BuildingMicrositePage({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  try {
    // Validaciones más estrictas del permalink
    if (!params?.permalink || typeof params.permalink !== 'string' || params.permalink.trim() === '') {
      console.error('Invalid permalink provided:', params)
      notFound()
    }

    const data = await getBuildingWithDepartmentsByPermalink(params.permalink)

    // Validaciones más completas de los datos
    if (!data) {
      console.error('No data returned from getBuildingWithDepartmentsByPermalink:', { permalink: params.permalink })
      notFound()
    }

    if (!data.building) {
      console.error('No building data found:', { data, permalink: params.permalink })
      notFound()
    }

    if (!data.building.nombre || typeof data.building.nombre !== 'string') {
      console.error('Building name is invalid:', { building: data.building, permalink: params.permalink })
      notFound()
    }

    // Asegurar que departments sea siempre un array válido
    const validDepartments = Array.isArray(data.departments) ? data.departments : []
    
    // Log para debugging en producción
    console.log('Building page loaded successfully:', {
      buildingName: data.building.nombre,
      departmentsCount: validDepartments.length,
      permalink: params.permalink
    })

    // Validar estructura del building más profundamente
    const safeBuilding = {
      ...data.building,
      id: data.building.id || 0,
      nombre: data.building.nombre || '',
      direccion: data.building.direccion || '',
      permalink: data.building.permalink || params.permalink,
      costo_expensas: data.building.costo_expensas || 0,
      areas_comunales: Array.isArray(data.building.areas_comunales) ? data.building.areas_comunales : [],
      seguridad: Array.isArray(data.building.seguridad) ? data.building.seguridad : [],
      aparcamiento: Array.isArray(data.building.aparcamiento) ? data.building.aparcamiento : [],
      url_imagen_principal: data.building.url_imagen_principal || '',
      imagenes_secundarias: Array.isArray(data.building.imagenes_secundarias) ? data.building.imagenes_secundarias : [],
      fecha_creacion: data.building.fecha_creacion || ''
    }

    return <MicrositeContent building={safeBuilding} departments={validDepartments} />
  } catch (error) {
    console.error('Error loading building page:', error, { permalink: params?.permalink })
    
    // Log específico para errores React #310
    if (error instanceof Error && error.message.includes('310')) {
      console.error('🚨 POTENTIAL REACT ERROR #310 IN BUILDING PAGE:', {
        error: error.message,
        stack: error.stack,
        permalink: params?.permalink
      })
    }
    
    notFound()
  }
}

// Generar metadata dinámico para SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  try {
    const data = await getBuildingWithDepartmentsByPermalink(params.permalink)

    if (!data || !data.building || !data.building.nombre) {
      return {
        title: 'Edificio no encontrado - HomEstate',
      }
    }

    const { building, departments = [] } = data

    return {
      title: `${building.nombre} - ${departments.length} departamentos - HomEstate`,
      description: `Micrositio del edificio ${building.nombre} ubicado en ${building.direccion}. ${departments.length} departamentos disponibles.`,
      openGraph: {
        title: `${building.nombre} - HomEstate`,
        description: `Micrositio del edificio ${building.nombre} con ${departments.length} departamentos`,
        images: building.url_imagen_principal ? [building.url_imagen_principal] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Error - HomEstate',
    }
  }
} 