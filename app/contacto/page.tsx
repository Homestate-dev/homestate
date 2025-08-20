"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Star, Building2, Users, TrendingUp, ExternalLink } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function ContactoPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [tallyLink, setTallyLink] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/api/page-configuration')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setWhatsappNumber(data.data.whatsapp_number || "")
          setTallyLink(data.data.tally_link || "")
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) {
      console.warn('Número de WhatsApp no configurado')
      return
    }
    
    const message = "Hola! Me interesa formar parte de HomEstate. ¿Podrían darme más información?"
    const cleanNumber = whatsappNumber.replace(/[\s\+\-\(\)]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleTallyClick = () => {
    if (!tallyLink) {
      console.warn('Enlace de Tally no configurado')
      return
    }
    
    window.open(tallyLink, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <Header />

      {loading && (
        <div className="fixed top-0 left-0 w-full bg-orange-500 text-white text-center py-2 z-50">
          <p className="text-sm">🔄 Cargando configuración de contacto...</p>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16 sm:space-y-32">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-blue-600/10 rounded-3xl"></div>
          <div className="relative text-center py-12 sm:py-20 px-4 sm:px-8">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <Image
                  src="/logo-qr.png"
                  alt="Homestate Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-lg w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40"
                />
                
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-6 sm:mb-8 leading-tight px-2">
              ¡QUÉ ES{" "}
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent font-light">
                HomEstate
              </span>
              ?
            </h1>
            
            <div className="max-w-4xl mx-auto px-2">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
                Descubre cómo <span className="font-light">HomEstate</span> transforma el mundo de los bienes raíces. Nuestro servicio está diseñado específicamente para que nuestros socios estratégicos, como edificios y conjuntos, maximicen sus ingresos y aseguren el financiamiento óptimo para el mantenimiento general.{" "}
                <span className="font-bold text-orange-600">¡Impulsa el valor de tu propiedad con <span className="font-light">HomEstate</span>!</span>
              </p>
            </div>
          </div>
        </section>

        {/* Experiencia Digital Section */}
        <section className="relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-3 bg-orange-100 text-orange-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                EXPERIENCIA DIGITAL
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Tecnología Avanzada para{" "}
                <span className="text-orange-600">Tu Futuro</span>
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                Utiliza nuestra tecnología avanzada de búsqueda y visualización en tiempo real para encontrar la propiedad perfecta que se adapte a tus necesidades. Con nosotros, la búsqueda de tu nuevo hogar nunca ha sido tan sencilla y emocionante.{" "}
                <span className="font-bold text-orange-600">¡No esperes más y aprovecha esta experiencia innovadora!</span>
              </p>
              
              
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">Características Destacadas</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-sm sm:text-base">Maximización de ingresos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-sm sm:text-base">Gestión de comunidades</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-sm sm:text-base">Financiamiento optimizado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Únete a Homestate Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  ¡ÚNETE A NOSOTROS!
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Conviértete en Nuestro{" "}
                  <span className="text-yellow-300">Socio Estratégico</span>
                </h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                    ¡Conviértete en nuestro socio y olvídate de las cuotas extraordinarias de tu edificio o conjunto! Únete a la revolución inmobiliaria y descubre cómo te ayudamos a maximizar tus ingresos y simplificar la gestión de tus propiedades.
                  </p>
                  
                  <p className="text-base sm:text-lg md:text-xl leading-relaxed font-semibold">
                    ¡No te quedes atrás, contáctanos ahora, transforma tu experiencia inmobiliaria con nosotros y disfruta de los beneficios hoy mismo!
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {whatsappNumber && (
                    <Button
                      onClick={handleWhatsAppClick}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <FaWhatsapp className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                      {loading ? 'Cargando...' : '¡Contáctanos Ahora!'}
                    </Button>
                  )}
                  
                  {tallyLink && (
                    <Button
                      onClick={handleTallyClick}
                      disabled={loading}
                      variant="outline"
                      className="border-pink-500 text-pink-600 hover:bg-pink-50 text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <ExternalLink className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                      {loading ? 'Cargando...' : 'Completar Formulario'}
                    </Button>
                  )}
                  
                  {!loading && !whatsappNumber && !tallyLink && (
                    <div className="text-center w-full">
                      <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                        <p className="text-orange-800 text-sm">
                          ⚠️ Configuración de contacto no disponible. 
                          Contacta al administrador para configurar WhatsApp y Tally.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/WhatsApp%20Image%202025-07-29%20at%2016.14.07.jpeg?alt=media&token=3c224812-498b-4156-800a-9f4ed1491a99"
                    alt="Miembro HomEstate"
                    width={400}
                    height={400}
                    className="rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white/30 shadow-2xl object-cover w-full h-auto"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-20 h-20 sm:w-32 sm:h-32 bg-orange-300/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios Section */}
        <section className="space-y-8 sm:space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              ¿Por Qué Elegir{" "}
              <span className="text-orange-600 font-light">HomEstate</span>?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Descubre las ventajas que hacen de <span className="font-light">HomEstate</span> la elección perfecta para tu propiedad
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Maximización de Ingresos",
                desc: "Optimiza el rendimiento financiero de tu propiedad con nuestras estrategias avanzadas.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Gestión Simplificada",
                desc: "Administra tu edificio o conjunto de manera eficiente y sin complicaciones.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Comunidad Satisfecha",
                desc: "Mantén a tus residentes contentos con servicios de calidad superior.",
                color: "from-purple-500 to-purple-600"
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${item.color} text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            ¿Listo para Transformar tu Propiedad?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Únete a los propietarios que ya confían en <span className="font-light">HomEstate</span> para maximizar sus inversiones
          </p>
          
          {tallyLink ? (
            <>
              <Button
                onClick={handleTallyClick}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-sm sm:text-lg md:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
              >
                <ExternalLink className="mr-2 sm:mr-4 h-4 w-4 sm:h-6 sm:w-6" />
                {loading ? 'Cargando...' : '¡Completa el Formulario!'}
              </Button>
              
              <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400">
                Se abrirá una ventana con el formulario • Consulta sin compromiso • Respuesta en 24h
              </p>
            </>
          ) : (
            <>
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
                <p className="text-orange-800 text-sm">
                  ⚠️ Formulario de contacto no configurado. 
                  Contacta al administrador para configurar el enlace de Tally.
                </p>
              </div>
              
              <Button
                disabled
                className="bg-gray-400 cursor-not-allowed text-white text-sm sm:text-lg md:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-2xl font-bold"
              >
                <ExternalLink className="mr-2 sm:mr-4 h-4 w-4 sm:h-6 sm:w-6" />
                Formulario No Disponible
              </Button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
