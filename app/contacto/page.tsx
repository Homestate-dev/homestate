"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Header } from "@/components/header"

export default function ContactoPage() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+5491112345678" // Reemplazar con el número real
    const message = "Hola! Me interesa formar parte de HomEState. ¿Podrían darme más información?"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Botón de volver atrás */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <Logo size={120} className="text-orange-600" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ¿Qué es <span className="text-orange-600">HomEState</span>?
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            HomEState es la plataforma inmobiliaria más innovadora que conecta a propietarios, 
            inquilinos y profesionales del sector inmobiliario en una experiencia digital única.
          </p>
        </div>

        {/* Sección de características */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🏠 Tu Nuevo Sitio</h3>
            <p className="text-gray-600 leading-relaxed">
              Encuentra tu hogar ideal con nuestra tecnología avanzada de búsqueda y 
              visualización de propiedades en tiempo real.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📱 Experiencia Digital</h3>
            <p className="text-gray-600 leading-relaxed">
              Micrositios personalizados para cada edificio, tours virtuales y 
              gestión inteligente de propiedades.
            </p>
          </div>
        </div>

        {/* Sección de unirse */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white text-center mb-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¡Únete a HomEState!
            </h2>
            
            <p className="text-xl mb-8 leading-relaxed">
              Forma parte de la revolución inmobiliaria. Somos una empresa en crecimiento 
              que busca profesionales apasionados por la tecnología y el sector inmobiliario.
            </p>
            
            <div className="flex justify-center mb-8">
              <Image
                src="/placeholder-user.jpg"
                alt="Persona invitando a unirse a HomEState"
                width={200}
                height={200}
                className="rounded-full border-4 border-white shadow-lg"
              />
            </div>
            
            <p className="text-lg mb-8">
              "Estamos buscando personas talentosas que quieran cambiar la forma en que 
              se vive la experiencia inmobiliaria. Si te apasiona la innovación y quieres 
              ser parte de algo grande, ¡HomEState es tu lugar!"
            </p>
          </div>
        </div>

        {/* Beneficios de unirse */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Crecimiento Profesional</h3>
            <p className="text-gray-600">
              Oportunidades de desarrollo en una empresa en expansión
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Innovación Constante</h3>
            <p className="text-gray-600">
              Trabaja con las últimas tecnologías del sector inmobiliario
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Equipo Dinámico</h3>
            <p className="text-gray-600">
              Ambiente colaborativo y cultura de trabajo flexible
            </p>
          </div>
        </div>

        {/* Botón de WhatsApp */}
        <div className="text-center">
          <Button 
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white text-xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <FaWhatsapp className="h-6 w-6 mr-3" />
            ¡Contáctanos por WhatsApp!
          </Button>
          
          <p className="text-gray-500 mt-4 text-sm">
            Responde en minutos • Consulta sin compromiso
          </p>
        </div>
      </div>
    </div>
  )
} 