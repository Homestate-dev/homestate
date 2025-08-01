"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Star, Building2, Users, TrendingUp } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function ContactoPage() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+5491112345678"
    const message = "Hola! Me interesa formar parte de HomEState. ¿Podrían darme más información?"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-32">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-blue-600/10 rounded-3xl"></div>
          <div className="relative text-center py-20 px-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src="/logo-qr.png"
                  alt="Homestate Logo"
                  width={180}
                  height={180}
                  className="drop-shadow-lg"
                />
                
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
              ¡QUÉ ES{" "}
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent font-light">
                HomEstate
              </span>
              ?
            </h1>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
                Descubre cómo <span className="font-light">HomEstate</span> transforma el mundo de los bienes raíces. Nuestro servicio está diseñado específicamente para que nuestros socios estratégicos, como edificios y conjuntos, maximicen sus ingresos y aseguren el financiamiento óptimo para el mantenimiento general.{" "}
                <span className="font-bold text-orange-600">¡Impulsa el valor de tu propiedad con <span className="font-light">HomEstate</span>!</span>
              </p>
            </div>
          </div>
        </section>

        {/* Experiencia Digital Section */}
        <section className="relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-orange-100 text-orange-700 px-6 py-3 rounded-full font-semibold">
                <Building2 className="w-5 h-5" />
                EXPERIENCIA DIGITAL
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Tecnología Avanzada para{" "}
                <span className="text-orange-600">Tu Futuro</span>
              </h2>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Utiliza nuestra tecnología avanzada de búsqueda y visualización en tiempo real para encontrar la propiedad perfecta que se adapte a tus necesidades. Con nosotros, la búsqueda de tu nuevo hogar nunca ha sido tan sencilla y emocionante.{" "}
                <span className="font-bold text-orange-600">¡No esperes más y aprovecha esta experiencia innovadora!</span>
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Búsqueda Inteligente</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Gestión Simplificada</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-4">Características Destacadas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span>Maximización de ingresos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <span>Gestión de comunidades</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span>Financiamiento optimizado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Únete a Homestate Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl p-12 text-white shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold">
                  <Star className="w-5 h-5" />
                  ¡ÚNETE A <span className="font-light">HomEstate</span>!
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Conviértete en Nuestro{" "}
                  <span className="text-yellow-300">Socio Estratégico</span>
                </h2>
                
                <div className="space-y-6">
                  <p className="text-xl leading-relaxed">
                    ¡Conviértete en nuestro socio y olvídate de las cuotas extraordinarias de tu edificio o conjunto! Únete a la revolución inmobiliaria y descubre cómo te ayudamos a maximizar tus ingresos y simplificar la gestión de tus propiedades.
                  </p>
                  
                  <p className="text-xl leading-relaxed font-semibold">
                    ¡No te quedes atrás, contáctanos ahora, transforma tu experiencia inmobiliaria con nosotros y disfruta de los beneficios hoy mismo!
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleWhatsAppClick}
                    className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <FaWhatsapp className="mr-3 h-5 w-5" />
                    ¡Contáctanos Ahora!
                  </Button>
                  
                 
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/WhatsApp%20Image%202025-07-29%20at%2016.14.07.jpeg?alt=media&token=3c224812-498b-4156-800a-9f4ed1491a99"
                    alt="Miembro HomEState"
                    width={400}
                    height={400}
                    className="rounded-2xl border-4 border-white/30 shadow-2xl object-cover w-full h-auto"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-300/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios Section */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Por Qué Elegir{" "}
              <span className="text-orange-600 font-light">HomEstate</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre las ventajas que hacen de <span className="font-light">HomEstate</span> la elección perfecta para tu propiedad
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Maximización de Ingresos",
                desc: "Optimiza el rendimiento financiero de tu propiedad con nuestras estrategias avanzadas.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Building2 className="w-8 h-8" />,
                title: "Gestión Simplificada",
                desc: "Administra tu edificio o conjunto de manera eficiente y sin complicaciones.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Comunidad Satisfecha",
                desc: "Mantén a tus residentes contentos con servicios de calidad superior.",
                color: "from-purple-500 to-purple-600"
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${item.color} text-white rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para Transformar tu Propiedad?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a los propietarios que ya confían en <span className="font-light">HomEstate</span> para maximizar sus inversiones
          </p>
          
          <Button
            onClick={handleWhatsAppClick}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl px-12 py-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
          >
            <FaWhatsapp className="mr-4 h-6 w-6" />
            ¡Inicia tu Transformación Ahora!
          </Button>
          
          <p className="mt-6 text-sm text-gray-400">
            Respuesta inmediata • Consulta sin compromiso • Soporte 24/7
          </p>
        </section>
      </div>
    </div>
  )
}
