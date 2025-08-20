"use client"

import { useState, useEffect } from "react"
import { FaWhatsapp } from "react-icons/fa"

export function WhatsAppFloatButton() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWhatsAppNumber()
  }, [])

  const fetchWhatsAppNumber = async () => {
    try {
      const response = await fetch('/api/page-configuration')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.whatsapp_number) {
          setWhatsappNumber(data.data.whatsapp_number)
        }
      }
    } catch (error) {
      console.error('Error al obtener número de WhatsApp:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) {
      console.warn('Número de WhatsApp no configurado')
      return
    }
    
    // Limpiar el número (remover +, espacios, etc.)
    const cleanNumber = whatsappNumber.replace(/[\s\+\-\(\)]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber}`
    window.open(whatsappUrl, '_blank')
  }

  // No mostrar el botón si no hay número configurado o está cargando
  if (loading || !whatsappNumber) {
    return null
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-8 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-5 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp className="h-10 w-10" />
    </button>
  )
} 