"use client"

import { useState } from "react"
import { Share2, Copy, Facebook, Twitter, MessageCircle, Check, Instagram, Linkedin, Mail, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface DepartmentShareButtonProps {
  departmentName: string
  departmentNumber: string
  floor: number
  area: number
}

export function DepartmentShareButton({ 
  departmentName, 
  departmentNumber, 
  floor, 
  area 
}: DepartmentShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const getCurrentUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    return ""
  }

  const copyToClipboard = async () => {
    try {
      const url = getCurrentUrl()
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace se ha copiado al portapapeles",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      })
    }
  }

  const shareOnFacebook = () => {
    const url = getCurrentUrl()
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, "_blank", "width=600,height=400")
  }

  const shareOnTwitter = () => {
    const url = getCurrentUrl()
    const text = `Descubre ${departmentName} - Depto ${departmentNumber}, Piso ${floor}, ${area}m² - Disponible ahora`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
  }

  const shareOnWhatsApp = () => {
    const url = getCurrentUrl()
    const text = `Te comparto este departamento: ${departmentName} - Depto ${departmentNumber}, Piso ${floor}, ${area}m²`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareOnLinkedIn = () => {
    const url = getCurrentUrl()
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedinUrl, "_blank", "width=600,height=400")
  }

  const shareByEmail = () => {
    const url = getCurrentUrl()
    const subject = `Descubre ${departmentName} - Departamento disponible`
    const body = `Hola, te comparto este departamento que me pareció interesante:\n\n${departmentName}\nDepartamento: ${departmentNumber}\nPiso: ${floor}\nÁrea: ${area}m²\n\nPuedes ver más detalles en: ${url}`
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = emailUrl
  }

  const shareOnTelegram = () => {
    const url = getCurrentUrl()
    const text = `Descubre ${departmentName} - Depto ${departmentNumber}, Piso ${floor}, ${area}m² - Disponible`
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    window.open(telegramUrl, "_blank")
  }

  const shareOnPinterest = () => {
    const url = getCurrentUrl()
    const description = `${departmentName} - Departamento ${departmentNumber}, Piso ${floor}, ${area}m² - Disponible`
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}`
    window.open(pinterestUrl, "_blank", "width=600,height=400")
  }

  return (
    <div className="mt-8 text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3">
            <Share2 className="h-5 w-5 mr-2" />
            Compartir departamento
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          <DropdownMenuLabel className="text-center">
            🏠 Compartir {departmentName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Link className="h-4 w-4 mr-2 text-gray-600" />
            )}
            {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer">
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            WhatsApp
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Facebook
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer">
            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
            Twitter / X
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer">
            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
            LinkedIn
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareOnTelegram} className="cursor-pointer">
            <span className="h-4 w-4 mr-2 text-blue-500">✈️</span>
            Telegram
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareOnPinterest} className="cursor-pointer">
            <span className="h-4 w-4 mr-2 text-red-600">📌</span>
            Pinterest
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareByEmail} className="cursor-pointer">
            <Mail className="h-4 w-4 mr-2 text-gray-600" />
            Correo electrónico
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 