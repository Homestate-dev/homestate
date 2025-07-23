import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/favicon.ico" alt="HomEstate Logo" width={32} height={32} className="w-8 h-8" />
              <span className="font-bold text-xl text-orange-600">HomEstate</span>
            </div>
            <p className="text-gray-600 mb-4">
             Tu nuevo sitio, tu nueva historia.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-orange-600">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-orange-600">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-orange-600">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/edificios-en-la-zona" className="text-gray-600 hover:text-orange-600">
                  Edificios y Departamentos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-orange-600">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
            <address className="not-italic text-gray-600">
              <p>Av. Principal 123</p>
              <p>Ciudad, CP 12345</p>
              <p className="mt-2">Email: info@homestate.com</p>
              <p>Teléfono: (123) 456-7890</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HomEstate. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
