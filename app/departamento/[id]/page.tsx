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
              <ImageGallery images={departamento.imagenes} altText={departamento.nombre} />
            </div>

            {/* Información principal */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={departamento.disponible ? "default" : "secondary"}>
                    {departamento.disponible ? "Disponible" : "No disponible"}
                  </Badge>
                  <Badge variant="outline">{tipoMap[departamento.tipo]}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{departamento.nombre}</h1>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Piso {departamento.piso} · Depto {departamento.numero}
                </p>
              </div>

              {/* Precios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Precios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {departamento.valor_venta && departamento.valor_venta > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Precio de venta</p>
                      <p className="text-2xl font-bold text-green-600">${departamento.valor_venta.toLocaleString()}</p>
                    </div>
                  )}
                  {departamento.valor_arriendo && departamento.valor_arriendo > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Precio de arriendo</p>
                      <p className="text-2xl font-bold text-blue-600">${departamento.valor_arriendo.toLocaleString()}/mes</p>
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
                      <span className="text-sm font-medium">{habitacionesMap[departamento.cantidad_habitaciones] || departamento.cantidad_habitaciones}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bath className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{departamento.tiene_bano_completo ? "1 Baño" : "Sin baño"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Maximize className="h-6 w-6 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">{departamento.area} m²</span>
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
                    <Badge variant="outline">{estadoMap[departamento.estado]}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ideal para:</span>
                    <Badge variant="outline">{idealParaMap[departamento.ideal_para]}</Badge>
                  </div>
                  {departamento.amueblado && (
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
                    {departamento.tiene_living_comedor ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cocina separada</span>
                    {departamento.tiene_cocina_separada ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Antebaño</span>
                    {departamento.tiene_antebano ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Baño completo</span>
                    {departamento.tiene_bano_completo ? (
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
                    {departamento.tiene_aire_acondicionado ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Closets</span>
                    {departamento.tiene_placares ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cocina con horno y anafe</span>
                    {departamento.tiene_cocina_con_horno_y_anafe ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Muebles bajo mesada</span>
                    {departamento.tiene_muebles_bajo_mesada ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Desayunador de madera</span>
                    {departamento.tiene_desayunador_madera ? (
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
            departmentName={departamento.nombre}
            departmentNumber={departamento.numero}
            floor={departamento.piso}
            area={departamento.area}
          />

          {/* Componente cliente para transacciones */}
          <DepartmentClientWrapper 
            departamento={departamento} 
            edificio={departamento.edificio} 
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
