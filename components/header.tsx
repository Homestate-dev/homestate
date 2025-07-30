import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size={32} className="text-orange-600" />
          <span className="font-light text-xl text-orange-600 font-poppins">HomEstate</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
      
      
          <Link href="/edificios-en-la-zona" className="text-gray-700 hover:text-orange-600 font-medium">
            Edificios y Departamentos
          </Link>
          <Link href="/contacto" className="text-gray-700 hover:text-orange-600 font-medium">
            ¡Únete a nosotros!
          </Link>
        </nav>


      </div>
    </header>
  )
}
