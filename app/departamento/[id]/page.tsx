import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Users, Home, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ImageGallery } from "@/components/image-gallery"
import { DepartmentShareButton } from "@/components/department-share-button"
import { getDepartmentById } from "@/lib/database"
import DepartmentClientWrapper from "@/components/department-client-wrapper"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DepartamentoPage({ params }: PageProps) {
  const { id } = await params
  const departmentId = parseInt(id)

  if (isNaN(departmentId)) {
    notFound()
  }

  try {
    const departamento = await getDepartmentById(departmentId)

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
      area: departamento.area || 0,
      cantidad_habitaciones: departamento.cantidad_habitaciones || 'No especificado',
      tipo: departamento.tipo || '',
      estado: departamento.estado || '',
      ideal_para: departamento.ideal_para || '',
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
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Galería de imágenes */}
            <div className="lg:col-span-2">
              <ImageGallery images={safeDepartamento.imagenes} altText={safeDepartamento.nombre} />
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

              {/* Precios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Precios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {safeDepartamento.valor_venta && safeDepartamento.valor_venta > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Precio de venta</p>
                      <p className="text-2xl font-bold text-green-600">${safeDepartamento.valor_venta.toLocaleString()}</p>
                    </div>
                  )}
                  {safeDepartamento.valor_arriendo && safeDepartamento.valor_arriendo > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Precio de arriendo</p>
                      <p className="text-2xl font-bold text-blue-600">${safeDepartamento.valor_arriendo.toLocaleString()}/mes</p>
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
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Bed className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{habitacionesMap[safeDepartamento.cantidad_habitaciones] || safeDepartamento.cantidad_habitaciones}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bath className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{safeDepartamento.tiene_bano_completo ? "1 Baño" : "Sin baño"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Maximize className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{safeDepartamento.area} m²</span>
                    </div>
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
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ambientes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Ambientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <span>Sala comedor</span>
                    {safeDepartamento.tiene_living_comedor ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cocina separada</span>
                    {safeDepartamento.tiene_cocina_separada ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Antebaño</span>
                    {safeDepartamento.tiene_antebano ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Baño completo</span>
                    {safeDepartamento.tiene_bano_completo ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipamiento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Equipamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <span>Aire acondicionado</span>
                    {safeDepartamento.tiene_aire_acondicionado ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Closets</span>
                    {safeDepartamento.tiene_placares ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cocina con horno y anafe</span>
                    {safeDepartamento.tiene_cocina_con_horno_y_anafe ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Muebles bajo mesada</span>
                    {safeDepartamento.tiene_muebles_bajo_mesada ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Desayunador de madera</span>
                    {safeDepartamento.tiene_desayunador_madera ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botón de compartir */}
          <DepartmentShareButton
            departmentName={safeDepartamento.nombre}
            departmentNumber={safeDepartamento.numero}
            floor={safeDepartamento.piso}
            area={safeDepartamento.area}
          />

          {/* Componente cliente para transacciones */}
          <DepartmentClientWrapper 
            departamento={safeDepartamento} 
            edificio={safeDepartamento.edificio} 
          />
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Error al cargar departamento:', error)
    notFound()
  }
}
