import Link from 'next/link'
import { Building2, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edificio no encontrado
          </h1>
          <p className="text-gray-600">
            El micrositio que buscas no existe o ha sido eliminado.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al Panel Principal
          </Link>
          
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, contacta al administrador.
          </p>
        </div>
      </div>
    </div>
  )
} 