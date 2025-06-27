import { notFound } from 'next/navigation'
import { getBuildingWithDepartmentsByPermalink } from '@/lib/database'
import { MicrositeContent } from '@/components/microsite-content'

export default async function BuildingMicrositePage({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  const data = await getBuildingWithDepartmentsByPermalink(params.permalink)

  if (!data) {
    notFound()
  }

  return <MicrositeContent building={data.building} departments={data.departments} />
}

// Generar metadata dinámico para SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { permalink: string } 
}) {
  const data = await getBuildingWithDepartmentsByPermalink(params.permalink)

  if (!data) {
    return {
      title: 'Edificio no encontrado - HomEstate',
    }
  }

  const { building, departments } = data

  return {
    title: `${building.nombre} - ${departments.length} departamentos - HomEstate`,
    description: `Micrositio del edificio ${building.nombre} ubicado en ${building.direccion}. ${departments.length} departamentos disponibles.`,
    openGraph: {
      title: `${building.nombre} - HomEstate`,
      description: `Micrositio del edificio ${building.nombre} con ${departments.length} departamentos`,
      images: building.url_imagen_principal ? [building.url_imagen_principal] : [],
    },
  }
} 