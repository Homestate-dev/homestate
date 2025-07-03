import { notFound } from 'next/navigation'
import { getBuildingWithDepartmentsByPermalink } from '@/lib/database'
import { MicrositeContent } from '@/components/microsite-content'

export default async function BuildingMicrositePage({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  try {
    const data = await getBuildingWithDepartmentsByPermalink(params.permalink)

    if (!data || !data.building || !data.building.nombre) {
      console.error('Building data is invalid:', { data, permalink: params.permalink })
      notFound()
    }

    return <MicrositeContent building={data.building} departments={data.departments || []} />
  } catch (error) {
    console.error('Error loading building page:', error)
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