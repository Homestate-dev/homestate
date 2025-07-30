import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/ui/logo"

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Logo size={32} className="text-orange-600" />
              <span className="font-light text-xl text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>HomEstate</span>
            </div>
            <p className="text-gray-600 mb-4">
             Tu nuevo sitio, tu nueva historia.
            </p>
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
                <Link href="/contacto" className="text-gray-600 hover:text-orange-600">
                  Únete a nosotros
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HomEstate. Todos los derechos reservados.</p>
          <p className="mt-1">Realizado por TheMeanMachine</p>
        </div>
      </div>
    </footer>
  )
}
