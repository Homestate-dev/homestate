"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Header } from "@/components/header"

export default function ContactoPage() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+5491112345678"
    const message = "Hola! Me interesa formar parte de HomEState. ¿Podrían darme más información?"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Volver al inicio */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 py-12 space-y-24">
        {/* Sección de Introducción */}
        <section className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size={100} className="text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            ¿Qué es <span className="text-orange-600">HomEState</span>?
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            HomEState es la plataforma inmobiliaria más innovadora que conecta a propietarios, 
            inquilinos y profesionales en una experiencia digital única.
          </p>
        </section>

        {/* Características */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg transition hover:shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">🏠 Tu Nuevo Sitio</h3>
            <p className="text-gray-600">
              Encuentra tu hogar ideal con nuestra tecnología avanzada de búsqueda y visualización en tiempo real.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg transition hover:shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">📱 Experiencia Digital</h3>
            <p className="text-gray-600">
              Micrositios únicos para cada edificio, tours virtuales y gestión inteligente de propiedades.
            </p>
          </div>
        </section>

        {/* Sección Únete */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl p-10 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¡Únete a HomEState!
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Forma parte de la revolución inmobiliaria. Buscamos profesionales apasionados por la tecnología y el sector.
          </p>

          <div className="flex justify-center mb-8">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/WhatsApp%20Image%202025-07-29%20at%2016.14.07.jpeg?alt=media&token=3c224812-498b-4156-800a-9f4ed1491a99"
              alt="Miembro HomEState"
              width={220}
              height={220}
              className="rounded-xl border-4 border-white shadow-lg object-cover"
            />
          </div>

          <p className="text-lg italic max-w-2xl mx-auto mb-6">
            "Estamos buscando personas talentosas que quieran transformar la experiencia inmobiliaria. 
            Si te apasiona la innovación, ¡este es tu lugar!"
          </p>
        </section>

        {/* Beneficios */}
        <section className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "🚀", title: "Crecimiento Profesional", desc: "Desarrolla tu carrera en una empresa en expansión." },
            { icon: "💡", title: "Innovación Constante", desc: "Trabaja con tecnología de vanguardia en el sector." },
            { icon: "🤝", title: "Equipo Dinámico", desc: "Ambiente colaborativo con cultura flexible." },
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA WhatsApp */}
        <section className="text-center">
          <Button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white text-lg px-10 py-4 rounded-full shadow-md hover:scale-105 transition-transform"
          >
            <FaWhatsapp className="mr-3 h-5 w-5" />
            ¡Contáctanos por WhatsApp!
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            Respuesta rápida • Consulta sin compromiso
          </p>
        </section>
      </div>
    </div>
  )
}
