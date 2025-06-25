import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/favicon.ico" alt="HomEstate Logo" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-xl text-orange-600">HomEstate</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
      
      
          <Link href="#" className="text-gray-700 hover:text-orange-600 font-medium">
            Departamentos
          </Link>
          <Link href="#" className="text-gray-700 hover:text-orange-600 font-medium">
            Contacto
          </Link>
        </nav>

        <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Respuesta inmediata</span>
        </Button>
      </div>
    </header>
  )
}
