import { getBuildings } from "@/lib/database"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users } from "lucide-react"

export default async function EdificiosEnLaZonaPage() {
  const edificios = await getBuildings()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edificios en la zona</h1>
          <p className="text-gray-600">Descubre todos los edificios disponibles y encuentra más opciones que se adaptan a ti.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edificios.map((edificio: any) => (
            <Card key={edificio.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                {edificio.url_imagen_principal && (
                  <img
                    alt={edificio.nombre}
                    src={edificio.url_imagen_principal}
                    className="object-cover w-full h-full"
                    style={{ position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent" }}
                  />
                )}
              </div>
              <CardContent className="flex flex-col space-y-1.5 p-6 pb-2">
                <div className="font-semibold tracking-tight text-lg">{edificio.nombre}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  {edificio.direccion}
                </div>
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Departamentos:</span>
                  <span className="font-medium">{edificio.departamentos_count}</span>
                </div>
                <Link href={`/edificio/${edificio.permalink}`}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Ir a edificio</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
} 