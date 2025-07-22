import { getBuildings } from "@/lib/database"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users } from "lucide-react"
import EdificiosZonaBuscador from "@/components/edificios-zona-buscador"

export default async function EdificiosEnLaZonaPage() {
  const edificios = await getBuildings()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <EdificiosZonaBuscador edificios={edificios} />
      </main>
    </div>
  )
} 