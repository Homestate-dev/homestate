"use client"

import { FaWhatsapp } from "react-icons/fa"

export function WhatsAppFloatButton() {
  const handleWhatsAppClick = () => {
    // Número de WhatsApp (puedes cambiarlo por el número real)
    const phoneNumber = "56912345678" // Cambiar por el número real
    const message = "Hola, me interesa conocer más sobre los departamentos disponibles."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp className="h-8 w-8" />
    </button>
  )
} 