"use client"

import { useState } from "react"
import { QrCode, Download, Copy, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Building {
  id: number
  nombre: string
  direccion: string
  permalink: string
}

interface QRGeneratorProps {
  building: Building
}

export function QRGenerator({ building }: QRGeneratorProps) {
  const [qrGenerated, setQrGenerated] = useState(false)
  const [qrUrl, setQrUrl] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  const generateQR = () => {
    // Simular generación de QR
    const baseUrl = "https://homestate.com"
    const fullUrl = `${baseUrl}/${building.permalink}`
    setQrUrl(fullUrl)
    setQrGenerated(true)
  }

  const downloadQR = () => {
    console.log("Descargando QR...")
    // Aquí iría la lógica para descargar el QR
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl)
    console.log("URL copiada al portapapeles")
  }

  const shareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: building.nombre,
        text: `Conoce ${building.nombre}`,
        url: qrUrl,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generador de Código QR</h2>
        <p className="text-gray-600">Crea códigos QR para facilitar el acceso a la información del edificio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración del QR */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del QR</CardTitle>
            <CardDescription>Personaliza la información que se mostrará</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="building-name">Nombre del edificio</Label>
              <Input id="building-name" value={building.nombre} disabled />
            </div>

            <div>
              <Label htmlFor="building-address">Dirección</Label>
              <Input id="building-address" value={building.direccion} disabled />
            </div>

            <div>
              <Label htmlFor="permalink">URL del edificio</Label>
              <Input id="permalink" value={`homestate.com/${building.permalink}`} disabled />
            </div>

            <div>
              <Label htmlFor="custom-message">Mensaje personalizado (opcional)</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ej: ¡Descubre tu nuevo hogar en este increíble edificio!"
                rows={3}
              />
            </div>

            <Button onClick={generateQR} className="w-full bg-black hover:bg-gray-800 text-white">
              <QrCode className="h-4 w-4 mr-2" />
              Generar Código QR
            </Button>
          </CardContent>
        </Card>

        {/* Vista previa y descarga */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del QR</CardTitle>
            <CardDescription>
              {qrGenerated ? "Tu código QR está listo" : "Genera un código QR para ver la vista previa"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrGenerated ? (
              <div className="space-y-4">
                {/* Simulación del QR */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-24 w-24 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Código QR</p>
                      <p className="text-xs text-gray-500">{building.nombre}</p>
                    </div>
                  </div>
                </div>

                {/* Información del QR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL destino:</span>
                    <Badge variant="outline" className="text-xs">
                      {qrUrl}
                    </Badge>
                  </div>
                  {customMessage && (
                    <div>
                      <span className="text-sm text-gray-600">Mensaje:</span>
                      <p className="text-sm bg-gray-50 p-2 rounded mt-1">{customMessage}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="space-y-2">
                  <Button onClick={downloadQR} className="w-full bg-orange-600 hover:bg-orange-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar QR (PNG)
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={copyUrl}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar URL
                    </Button>
                    <Button variant="outline" onClick={shareQR}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Genera un código QR para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo usar el código QR?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-1">Imprime o comparte</h4>
              <p className="text-gray-600">
                Descarga el QR e imprímelo en folletos, carteles o compártelo digitalmente
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-1">Los clientes escanean</h4>
              <p className="text-gray-600">Los interesados pueden escanear el código con su teléfono móvil</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-1">Acceso directo</h4>
              <p className="text-gray-600">Acceden directamente a la información completa del edificio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
