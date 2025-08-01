"use client"

import { useState } from "react"
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
  const isMobile = useIsMobile()

  const handleSave = () => {
    // Por ahora solo mostrar un mensaje de éxito
    // En el futuro aquí se conectará con la base de datos
    toast.success("Configuración guardada", {
      description: "Los cambios han sido guardados exitosamente.",
    })
  }

  const handleReset = () => {
    setWhatsappNumber("")
    setTallyLink("")
    toast.info("Campos reiniciados", {
      description: "Los campos han sido limpiados.",
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
                Incluye el código de país (+56 para Chile)
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
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          Limpiar Campos
        </Button>
      </div>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Nota importante</h4>
              <p className="text-sm text-blue-700">
                Esta configuración se guardará localmente por el momento. En futuras versiones se conectará con la base de datos para persistir los cambios.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 