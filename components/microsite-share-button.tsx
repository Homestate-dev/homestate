"use client"

import { useState } from "react"
import { Share2, Copy, Facebook, Twitter, MessageCircle, Check } from "lucide-react"
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

interface MicrositeShareButtonProps {
  buildingName: string
  buildingAddress: string
}

export function MicrositeShareButton({ buildingName, buildingAddress }: MicrositeShareButtonProps) {
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
    const text = `Descubre ${buildingName} en ${buildingAddress} - Departamentos disponibles`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
  }

  const shareOnWhatsApp = () => {
    const url = getCurrentUrl()
    const text = `Te comparto este edificio: ${buildingName} en ${buildingAddress}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-50">
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Compartir micrositio</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </DropdownMenuItem>
        
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
          Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 