import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size={32} className="text-orange-600" />
          <span className="font-bold text-xl text-orange-600">HomEstate</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
      
      
          <Link href="/edificios-en-la-zona" className="text-gray-700 hover:text-orange-600 font-medium">
            Edificios y Departamentos
          </Link>
          <Link href="/contacto" className="text-gray-700 hover:text-orange-600 font-medium">
            Contacto
          </Link>
        </nav>

        <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
          <FaWhatsapp className="h-10 w-10" />
          <span className="hidden sm:inline">Respuesta inmediata</span>
        </Button>
      </div>
    </header>
  )
}
