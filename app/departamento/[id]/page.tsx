import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Users, Video, Check, X, Package, Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ImageGallery } from "@/components/image-gallery"
import { DepartmentShareButton } from "@/components/department-share-button"
import { getDepartmentById, getBuildings } from "@/lib/database"
import DepartmentClientWrapper from "@/components/department-client-wrapper"
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button"
import React from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

// Generar metadata dinámico para SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  try {
    const { id } = await params
    const departmentId = parseInt(id)

    if (isNaN(departmentId)) {
      return {
        title: 'Departamento no encontrado - HomEstate',
      }
    }

    const departamento = await getDepartmentById(departmentId)

    if (!departamento || !departamento.nombre) {
      return {
        title: 'Departamento no encontrado - HomEstate',
      }
    }

    // Construir precio para la descripción
    const precios = []
    if (departamento.valor_venta && departamento.valor_venta > 0) {
      precios.push(`Venta: $${departamento.valor_venta.toLocaleString()}`)
    }
    if (departamento.valor_arriendo && departamento.valor_arriendo > 0) {
      precios.push(`Arriendo: $${departamento.valor_arriendo.toLocaleString()}/mes`)
    }
    const precioTexto = precios.length > 0 ? ` - ${precios.join(' | ')}` : ''

    // Mapear habitaciones
    const habitacionesMap: Record<string, string> = {
      'Loft': "Loft",
      'Suite': "Suite", 
      '2': "2 habitaciones",
      '3': "3 habitaciones",
      '4': "4+ habitaciones"
    }
    const habitaciones = habitacionesMap[departamento.cantidad_habitaciones] || departamento.cantidad_habitaciones

    return {
      title: `${departamento.nombre} - Depto ${departamento.numero}, Piso ${departamento.piso} - HomEstate`,
      description: `${departamento.nombre} en ${departamento.edificio_nombre || 'edificio'}. ${habitaciones}, ${departamento.cantidad_banos || 1} baño${(departamento.cantidad_banos || 1) > 1 ? 's' : ''}, ${departamento.area_total}m²${precioTexto}. Ubicado en ${departamento.edificio_direccion || 'excelente ubicación'}.`,
      openGraph: {
        title: `${departamento.nombre} - Depto ${departamento.numero} - HomEstate`,
        description: `${habitaciones}, ${departamento.area_total}m² en ${departamento.edificio_nombre || 'edificio'}${precioTexto}`,
        images: ["/favicon.ico"],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for department:', error)
    return {
      title: 'Error - HomEstate',
    }
  }
}

export default async function DepartamentoPage({ params }: PageProps) {
  const { id } = await params
  const departmentId = parseInt(id)

  if (isNaN(departmentId)) {
    notFound()
  }

  try {
    const departamento = await getDepartmentById(departmentId)
    const edificios = await getBuildings() // Obtener edificios aquí

    if (!departamento) {
      notFound()
    }

    // Validaciones defensivas para evitar errores de propiedades undefined
    if (!departamento.nombre || typeof departamento.nombre !== 'string') {
      console.error('Department data is incomplete - missing nombre:', departamento)
      notFound()
    }

    // Asegurar que todas las propiedades críticas existan
    const safeDepartamento = {
      ...departamento,
      nombre: departamento.nombre || '',
      numero: departamento.numero || '',
      piso: departamento.piso || 0,
      area_total: departamento.area_total || 0,
      area_cubierta: departamento.area_cubierta || null,
      area_descubierta: departamento.area_descubierta || null,
      cantidad_banos: departamento.cantidad_banos || 1,
      cantidad_habitaciones: departamento.cantidad_habitaciones || 'No especificado',
      tipo: departamento.tipo || '',
      estado: departamento.estado || '',
      ideal_para: departamento.ideal_para || '',
      tiene_bodega: departamento.tiene_bodega || false,
      videos_url: Array.isArray(departamento.videos_url) ? departamento.videos_url : [],
      imagenes: Array.isArray(departamento.imagenes) ? departamento.imagenes : [],
      // Construir objeto edificio desde los campos de la base de datos
      edificio: {
        nombre: departamento.edificio_nombre || '',
        direccion: departamento.edificio_direccion || '',
        permalink: departamento.edificio_permalink || ''
      }
    }

    // Mapeos para traducir valores
    const habitacionesMap: Record<string, string> = {
      'Loft': "Loft",
      'Suite': "Suite",
      '2': "2 habitaciones",
      '3': "3 habitaciones",
    }

    const tipoMap: Record<string, string> = {
      'arriendo': "Arriendo",
      'venta': "Venta",
      'arriendo y venta': "Arriendo y Venta",
    }

    const estadoMap: Record<string, string> = {
      'nuevo': "Nuevo",
      'poco_uso': "Poco uso",
      'un_ano': "Un año",
      'mas_de_un_ano': "Más de un año",
      'remodelar': "Remodelar",
    }

    const idealParaMap: Record<string, string> = {
      'familia': "Familia",
      'pareja': "Pareja",
      'persona_sola': "Persona sola",
      'profesional': "Profesional",
    }

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild className="mb-4">
              <Link href={`/edificio/${safeDepartamento.edificio.permalink}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Galería de imágenes */}
            <div className="lg:col-span-2">
              <ImageGallery images={safeDepartamento.imagenes} alt={safeDepartamento.nombre} />
            </div>

            {/* Información principal */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={safeDepartamento.disponible ? "default" : "secondary"}>
                    {safeDepartamento.disponible ? "Disponible" : "No disponible"}
                  </Badge>
                  <Badge variant="outline">{tipoMap[safeDepartamento.tipo] || safeDepartamento.tipo}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{safeDepartamento.nombre}</h1>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Piso {safeDepartamento.piso} · Depto {safeDepartamento.numero}
                </p>
              </div>

              {/* Descripción del departamento */}
              {safeDepartamento.descripcion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg"></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {safeDepartamento.descripcion}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Precios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Precios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {safeDepartamento.valor_venta != null && safeDepartamento.valor_venta !== undefined && safeDepartamento.valor_venta > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Precio de venta</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-green-600">
                          ${safeDepartamento.valor_venta.toLocaleString()}
                        </p>
                        <p className="text-lg text-gray-500 line-through">
                          ${(safeDepartamento.valor_venta * 1.25).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {safeDepartamento.valor_arriendo != null && safeDepartamento.valor_arriendo !== undefined && safeDepartamento.valor_arriendo > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Precio de arriendo {safeDepartamento.incluye_alicuota ? '(Incluye alícuota)' : '(No incluye alícuota)'}</p>
                      {(() => {
                        const base = safeDepartamento.valor_arriendo || 0
                        const aliq = safeDepartamento.alicuota || 0
                        const total = safeDepartamento.incluye_alicuota ? base + aliq : base
                        return (
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-blue-600">
                              ${total.toLocaleString()}/mes
                            </p>
                            <p className="text-lg text-gray-500 line-through">
                              ${(total * 1.25).toLocaleString()}/mes
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Características principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Características</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Bed className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{habitacionesMap[safeDepartamento.cantidad_habitaciones] || safeDepartamento.cantidad_habitaciones}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bath className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{safeDepartamento.cantidad_banos || 1} Baño{safeDepartamento.cantidad_banos > 1 ? 's' : ''}</span>
                    </div>
                    {safeDepartamento.area_cubierta && (
                      <div className="flex flex-col items-center">
                        <Maximize className="h-6 w-6 text-orange-600 mb-2" />
                        <span className="text-sm font-medium">{safeDepartamento.area_cubierta} m²</span>
                        <span className="text-xs text-gray-500">Cubierta</span>
                      </div>
                    )}
                    {safeDepartamento.area_descubierta && (
                      <div className="flex flex-col items-center">
                        <Maximize className="h-6 w-6 text-orange-600 mb-2" />
                        <span className="text-sm font-medium">{safeDepartamento.area_descubierta} m²</span>
                        <span className="text-xs text-gray-500">Descubierta</span>
                      </div>
                    )}
                    {!safeDepartamento.area_cubierta && !safeDepartamento.area_descubierta && (
                      <div className="flex flex-col items-center">
                        <Maximize className="h-6 w-6 text-orange-600 mb-2" />
                        <span className="text-sm font-medium">{safeDepartamento.area_total} m²</span>
                      </div>
                    )}
                    {safeDepartamento.tiene_bodega && (
                      <div className="flex flex-col items-center">
                        <Package className="h-6 w-6 text-orange-600 mb-2" />
                        <span className="text-sm font-medium">Bodega</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge variant="outline">{estadoMap[safeDepartamento.estado] || safeDepartamento.estado}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ideal para:</span>
                    <Badge variant="outline">{idealParaMap[safeDepartamento.ideal_para] || safeDepartamento.ideal_para}</Badge>
                  </div>
                  {safeDepartamento.amueblado && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amoblado:</span>
                      <Badge variant="secondary">Sí</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detalles completos */}
          <div className="mt-12">
            {/* Ambientes y adicionales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Ambientes y adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeDepartamento.ambientes_y_adicionales && safeDepartamento.ambientes_y_adicionales.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {safeDepartamento.ambientes_y_adicionales.map((ambiente: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{ambiente}</span>
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No se han especificado ambientes y adicionales para este departamento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Videos de YouTube */}
          {safeDepartamento.videos_url && safeDepartamento.videos_url.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeDepartamento.videos_url.map((videoUrl: string, index: number) => {
                    // Extraer el ID del video de YouTube
                    const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
                    if (!videoId) return null
                    
                    return (
                      <div key={index} className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={`Video ${index + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botón de compartir */}
          <DepartmentShareButton
            departmentName={safeDepartamento.nombre}
            departmentNumber={safeDepartamento.numero}
            floor={safeDepartamento.piso}
            area={safeDepartamento.area_total}
          />
          {edificios && edificios.length > 0 && (
            <div className="my-6 p-4 rounded-lg bg-orange-50 border border-orange-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="font-semibold text-orange-700">¡Tenemos para ti {Math.floor(edificios.length * 0.6)} edificios más que te podrían interesar!</span>
                <p className="text-gray-700 mt-1">Descubre más opciones en otros edificios.</p>
              </div>
              <Link href="/edificios-en-la-zona">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white mt-2 md:mt-0">Ver otros departamentos cerca de ti</Button>
              </Link>
            </div>
          )}

          {/* Componente cliente para transacciones */}
          <DepartmentClientWrapper 
            departamento={safeDepartamento} 
            edificio={safeDepartamento.edificio} 
          />
        </main>
        <Footer />
        <WhatsAppFloatButton />
      </div>
    )
  } catch (error) {
    console.error('Error al cargar departamento:', error)
    notFound()
  }
}
