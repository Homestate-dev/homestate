"use client"

import { useState, useEffect } from "react"
import { Settings, Phone, Link } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

export function PageConfiguration() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [tallyLink, setTallyLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isMobile = useIsMobile()

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    fetchCurrentConfiguration()
  }, [])

  const fetchCurrentConfiguration = async () => {
    try {
      setLoading(true)
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
      toast.error("Error al cargar la configuración actual")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!whatsappNumber.trim() || !tallyLink.trim()) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/page-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsapp_number: whatsappNumber.trim(),
          tally_link: tallyLink.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success("Configuración guardada", {
            description: "Los cambios han sido guardados exitosamente en la base de datos.",
          })
        } else {
          toast.error("Error al guardar la configuración")
        }
      } else {
        toast.error("Error al guardar la configuración")
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      toast.error("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchCurrentConfiguration()
    toast.info("Campos restaurados", {
      description: "Los campos han sido restaurados a la configuración actual.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
          Configuración de Página
        </h3>
        <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
          Configura los enlaces y contactos de tu página web
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
        {/* Configuración de WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Número de WhatsApp
            </CardTitle>
            <CardDescription>
              Número de WhatsApp que aparecerá en el botón flotante y enlaces de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número de WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                No te olvides de incluir el código de país (+593 para Ecuador)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Tally */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              Link de Tally
            </CardTitle>
            <CardDescription>
              Enlace del formulario de Tally para capturar leads y consultas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tally">URL del formulario Tally</Label>
              <Input
                id="tally"
                type="url"
                placeholder="https://tally.so/r/..."
                value={tallyLink}
                onChange={(e) => setTallyLink(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Enlace completo del formulario de Tally
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-4'}`}>
        <Button 
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={saving || loading}
        >
          Restaurar Campos
        </Button>
      </div>

      {/* Información adicional */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">Configuración activa</h4>
              <p className="text-sm text-green-700">
                Esta configuración se guarda en la base de datos y se aplica inmediatamente. 
                El botón flotante de WhatsApp y los enlaces de Tally se actualizan automáticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 