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

// Datos de ejemplo (en una aplicación real, esto vendría de una base de datos)
const departamentosData = [
  {
    id: 1,
    numero: "101",
    nombre: "Departamento Ejecutivo",
    piso: 1,
    area: 85.5,
    valor_arriendo: 1200.0,
    valor_venta: 150000.0,
    precio_area: 1754.39,
    disponible: true,
    amueblado: true,
    cantidad_habitaciones: "dos",
    tipo: "duplex",
    estado: "nuevo",
    ideal_para: "familia",
    tiene_living_comedor: true,
    tiene_cocina_separada: true,
    tiene_antebano: true,
    tiene_bano_completo: true,
    tiene_aire_acondicionado: true,
    tiene_placares: true,
    tiene_cocina_con_horno_y_anafe: true,
    tiene_muebles_bajo_mesada: true,
    tiene_desayunador_madera: true,
    imagenes: [
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_44_51.png?updatedAt=1748865333316",
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2010_43_24.png?updatedAt=1748872354586",
      "https://ik.imagekit.io/dnots37tx/edificioMonta%C3%B1aTerraza1.PNG?updatedAt=1748872562512",
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_47_52.png?updatedAt=1748872642097",
    ],
    edificio: {
      nombre: "Edificio Mirador",
      direccion: "Av. Principal 123",
    },
    descripcion_completa:
      "Hermoso departamento ejecutivo ubicado en el primer piso del prestigioso Edificio Mirador. Cuenta con acabados de primera calidad, amplios espacios y una distribución funcional perfecta para familias modernas. La propiedad se entrega completamente amoblada con muebles de diseño contemporáneo.",
    fecha_construccion: "2023",
    orientacion: "Norte-Este",
    balcon: true,
    vista: "Ciudad y montañas",
    gastos_comunes: 180,
    expensas_incluidas: ["Agua", "Gas", "Mantenimiento", "Seguridad"],
  },
  {
    id: 2,
    numero: "102",
    nombre: "Departamento Familiar",
    piso: 1,
    area: 120.0,
    valor_arriendo: null,
    valor_venta: 180000.0,
    precio_area: 1500.0,
    disponible: true,
    amueblado: false,
    cantidad_habitaciones: "tres",
    tipo: "piso",
    estado: "poco_uso",
    ideal_para: "familia",
    tiene_living_comedor: true,
    tiene_cocina_separada: true,
    tiene_antebano: false,
    tiene_bano_completo: true,
    tiene_aire_acondicionado: false,
    tiene_placares: true,
    tiene_cocina_con_horno_y_anafe: false,
    tiene_muebles_bajo_mesada: false,
    tiene_desayunador_madera: false,
    imagenes: [
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_44_51.png?updatedAt=1748865333316",
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2010_43_24.png?updatedAt=1748872354586",
      "https://ik.imagekit.io/dnots37tx/edificioMonta%C3%B1aTerraza1.PNG?updatedAt=1748872562512",
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_47_52.png?updatedAt=1748872642097",
    ],
    edificio: {
      nombre: "Edificio Mirador",
      direccion: "Av. Principal 123",
    },
    descripcion_completa:
      "Amplio departamento familiar de tres habitaciones, ideal para familias que buscan espacio y comodidad. Ubicado en el primer piso con fácil acceso. La propiedad cuenta con excelente iluminación natural y espacios bien distribuidos.",
    fecha_construccion: "2022",
    orientacion: "Sur-Oeste",
    balcon: true,
    vista: "Jardín interno",
    gastos_comunes: 220,
    expensas_incluidas: ["Agua", "Mantenimiento", "Seguridad"],
  },
  {
    id: 3,
    numero: "201",
    nombre: "Estudio Moderno",
    piso: 2,
    area: 45.0,
    valor_arriendo: 800.0,
    valor_venta: null,
    precio_area: null,
    disponible: true,
    amueblado: true,
    cantidad_habitaciones: "loft",
    tipo: "estudio",
    estado: "nuevo",
    ideal_para: "soltero",
    tiene_living_comedor: false,
    tiene_cocina_separada: false,
    tiene_antebano: false,
    tiene_bano_completo: true,
    tiene_aire_acondicionado: true,
    tiene_placares: true,
    tiene_cocina_con_horno_y_anafe: true,
    tiene_muebles_bajo_mesada: true,
    tiene_desayunador_madera: false,
    imagenes: [
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2010_15_12.png?updatedAt=1748870678315",
      "https://ik.imagekit.io/dnots37tx/ChatGPT%20Image%202%20jun%202025,%2008_47_52.png?updatedAt=1748872642097",
    ],
    edificio: {
      nombre: "Edificio Mirador",
      direccion: "Av. Principal 123",
    },
    descripcion_completa:
      "Moderno estudio completamente equipado, perfecto para profesionales jóvenes o estudiantes. Diseño contemporáneo con aprovechamiento máximo del espacio. Incluye todos los electrodomésticos y mobiliario necesario.",
    fecha_construccion: "2024",
    orientacion: "Norte",
    balcon: false,
    vista: "Ciudad",
    gastos_comunes: 120,
    expensas_incluidas: ["Agua", "Gas", "Internet", "Mantenimiento", "Seguridad"],
  },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DepartamentoPage({ params }: PageProps) {
  const { id } = await params
  const departamento = departamentosData.find((d) => d.id === Number.parseInt(id))

  if (!departamento) {
    notFound()
  }

  // Mapeos para traducir valores
  const habitacionesMap: Record<string, string> = {
    loft: "Loft",
    suite: "Suite",
    dos: "2 habitaciones",
    tres: "3 habitaciones",
  }

  const tipoMap: Record<string, string> = {
    piso: "Piso",
    duplex: "Dúplex",
    penthouse: "Penthouse",
    estudio: "Estudio",
  }

  const estadoMap: Record<string, string> = {
    nuevo: "Nuevo",
    poco_uso: "Poco uso",
    un_ano: "Un año",
    mas_de_un_ano: "Más de un año",
    remodelar: "Remodelar",
  }

  const idealParaMap: Record<string, string> = {
    familia: "Familia",
    pareja: "Pareja",
    soltero: "Soltero",
    estudiantes: "Estudiantes",
    inversion: "Inversión",
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
            <ImageGallery images={departamento.imagenes} alt={departamento.nombre} />
          </div>

          {/* Información principal */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{departamento.nombre}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {departamento.edificio.direccion} - Piso {departamento.piso}, Depto {departamento.numero}
                    </CardDescription>
                  </div>
                  <Badge className="bg-orange-600 hover:bg-orange-700">{tipoMap[departamento.tipo]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Precios */}
                  <div>
                    {departamento.valor_venta && (
                      <p className="text-3xl font-bold text-gray-900">${departamento.valor_venta.toLocaleString()}</p>
                    )}
                    {departamento.valor_arriendo && (
                      <p className="text-2xl font-bold text-gray-900">
                        ${departamento.valor_arriendo.toLocaleString()}/mes
                      </p>
                    )}
                    {departamento.precio_area && (
                      <p className="text-sm text-gray-600">${departamento.precio_area.toLocaleString()}/m²</p>
                    )}
                  </div>

                  <Separator />

                  {/* Características principales */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Bed className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                      <p className="text-sm font-medium">{habitacionesMap[departamento.cantidad_habitaciones]}</p>
                    </div>
                    <div className="text-center">
                      <Bath className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                      <p className="text-sm font-medium">{departamento.tiene_bano_completo ? "1 baño" : "Sin baño"}</p>
                    </div>
                    <div className="text-center">
                      <Maximize className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                      <p className="text-sm font-medium">{departamento.area} m²</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Información adicional */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className="text-sm font-medium">{estadoMap[departamento.estado]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ideal para:</span>
                      <span className="text-sm font-medium">{idealParaMap[departamento.ideal_para]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Orientación:</span>
                      <span className="text-sm font-medium">{departamento.orientacion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vista:</span>
                      <span className="text-sm font-medium">{departamento.vista}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gastos comunes:</span>
                      <span className="text-sm font-medium">${departamento.gastos_comunes}/mes</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {departamento.amueblado && <Badge variant="secondary">Amoblado</Badge>}
                    {departamento.balcon && <Badge variant="secondary">Con balcón</Badge>}
                    <Badge variant="secondary">Año {departamento.fecha_construccion}</Badge>
                  </div>

                  {/* Botón de contacto */}
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-3">
                    Contactar por este departamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Descripción completa */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{departamento.descripcion_completa}</p>
            </CardContent>
          </Card>
        </div>

        {/* Características detalladas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ambientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-orange-600" />
                Ambientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Sala comedor</span>
                  {departamento.tiene_living_comedor ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Cocina separada</span>
                  {departamento.tiene_cocina_separada ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Antebaño</span>
                  {departamento.tiene_antebano ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Baño completo</span>
                  {departamento.tiene_bano_completo ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Equipamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Aire acondicionado</span>
                  {departamento.tiene_aire_acondicionado ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Closets</span>
                  {departamento.tiene_placares ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Cocina con horno y anafe</span>
                  {departamento.tiene_cocina_con_horno_y_anafe ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Muebles bajo mesada</span>
                  {departamento.tiene_muebles_bajo_mesada ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Desayunador de madera</span>
                  {departamento.tiene_desayunador_madera ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expensas incluidas */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expensas incluidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {departamento.expensas_incluidas.map((expensa, index) => (
                  <Badge key={index} variant="outline" className="border-orange-200 bg-orange-50 text-orange-800">
                    {expensa}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
