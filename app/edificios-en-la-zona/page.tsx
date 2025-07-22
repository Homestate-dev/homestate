import { getBuildings } from "@/lib/database"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users } from "lucide-react"
import { useState } from "react"

export default async function EdificiosEnLaZonaPage() {
  const edificios = await getBuildings()

  // --- Buscador en cliente ---
  // NOTA: Como esta es una página async, hay que hacer el filtrado en el cliente, así que el componente debe ser Client Component
  // Por eso, vamos a extraer la lógica a un componente hijo que sea "use client"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <EdificiosZonaBuscador edificios={edificios} />
      </main>
    </div>
  )
}

// Nuevo componente cliente para el buscador y listado
'use client'
import { useState } from "react"

function EdificiosZonaBuscador({ edificios }: { edificios: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const filteredEdificios = edificios.filter((edificio) =>
    edificio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edificio.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edificios en la zona</h1>
          <p className="text-gray-600">Descubre todos los edificios disponibles y encuentra más opciones que se adaptan a ti.</p>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o dirección..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEdificios.map((edificio: any) => (
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
    </>
  )
} 