"use client"

import { useState, useEffect, useRef } from "react"
import { Settings, Phone, Link, QrCode, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import QRCodeLib from "qrcode"

export function PageConfiguration() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [tallyLink, setTallyLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  // Función para combinar QR con logo
  const combineQRWithLogo = async (qrDataUrl: string, logoUrl: string = '/logo-qr.png'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'))
        return
      }

      const qrImage = new Image()
      const logoImage = new Image()

      qrImage.onload = () => {
        // Configurar canvas con el tamaño del QR
        canvas.width = qrImage.width
        canvas.height = qrImage.height

        // Dibujar el QR
        ctx.drawImage(qrImage, 0, 0)

        // Cargar y dibujar el logo
        logoImage.onload = () => {
          // Tamaño fijo del logo: 64x64 píxeles
          const logoSize = 64
          const logoX = (canvas.width - logoSize) / 2
          const logoY = (canvas.height - logoSize) / 2

          // Crear un fondo circular blanco para el logo
          ctx.save()
          ctx.beginPath()
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 6, 0, 2 * Math.PI)
          ctx.fillStyle = 'white'
          ctx.fill()
          ctx.restore()

          // Dibujar el logo redimensionado a 64x64
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)

          // Convertir a data URL
          resolve(canvas.toDataURL('image/png'))
        }

        logoImage.onerror = () => {
          // Si no se puede cargar el logo, devolver solo el QR
          console.warn('No se pudo cargar el logo, usando QR sin logo')
          resolve(qrDataUrl)
        }

        logoImage.src = logoUrl
      }

      qrImage.onerror = () => {
        reject(new Error('No se pudo cargar el QR'))
      }

      qrImage.src = qrDataUrl
    })
  }

  const generateTallyQR = async () => {
    if (!tallyLink.trim()) {
      toast.error("Por favor, ingresa un link de Tally válido")
      return
    }

    try {
      // Generar QR con la biblioteca qrcode en color naranja mandarina (SIN LOGO)
      const dataUrl = await QRCodeLib.toDataURL(tallyLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#FF6B35', // Naranja mandarina
          light: '#ffffff'
        }
      })
      
      // Para Tally NO combinar con logo - usar el QR directamente
      setQrDataUrl(dataUrl)
      setQrGenerated(true)
      
      toast.success("Código QR generado", {
        description: "El código QR para el link de Tally ha sido generado exitosamente (sin logo).",
      })
    } catch (error) {
      console.error('Error generando QR:', error)
      toast.error("Error al generar el código QR")
    }
  }

  const downloadTallyQR = async (format: 'png') => {
    try {
      if (format === 'png') {
        // Descargar PNG sin logo
        const link = document.createElement('a')
        link.href = qrDataUrl
        link.download = `qr-tally-homestate-sin-logo.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success("QR descargado", {
          description: "El código QR PNG (sin logo) ha sido descargado exitosamente.",
        })
      }
    } catch (error) {
      console.error('Error descargando QR:', error)
      toast.error("Error al descargar el código QR")
    }
  }

  const downloadTallyEPS = async () => {
    if (!tallyLink.trim()) {
      toast.error("Por favor, ingresa un link de Tally válido")
      return
    }

    try {
      // Generar estructura QR y acceder a la matriz de módulos
      const qr = QRCodeLib.create(tallyLink, {
        errorCorrectionLevel: 'M'
      }) as any

      const bitMatrix = qr.modules
      const moduleCount: number = bitMatrix.size || bitMatrix.length

      const quietZone = 4
      const total = moduleCount + quietZone * 2

      const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0
%%Title: QR Code - Tally HomeState
%%Creator: HomeState QR Generator
%%BoundingBox: 0 0 ${total} ${total}
%%Pages: 1
%%LanguageLevel: 2
%%EndComments

%%Page: 1 1
gsave
0 setgray
`;

      let epsBody = '';

      const isDark = (x: number, y: number): boolean => {
        if (typeof bitMatrix.get === 'function') {
          return bitMatrix.get(x, y)
        }
        return !!bitMatrix[y][x]
      }

      // Dibujar el QR en color naranja (SIN espacio para logo)
      epsBody += `% QR Code in orange color - sin logo\n`
      epsBody += `1 0.42 0.21 setrgbcolor\n` // Color naranja mandarina #FF6B35
      
      for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
          if (isDark(x, y)) {
            const psX = x + quietZone
            const psY = total - (y + quietZone) - 1
            epsBody += `${psX} ${psY} 1 1 rectfill\n`
          }
        }
      }

      const epsFooter = `grestore
showpage
%%EOF`

      const epsContent = epsHeader + epsBody + epsFooter

      // Descargar el archivo EPS
      const epsBlob = new Blob([epsContent], { type: 'application/postscript' })
      const epsLink = document.createElement('a')
      epsLink.href = URL.createObjectURL(epsBlob)
      epsLink.download = `qr-tally-homestate-sin-logo.eps`
      document.body.appendChild(epsLink)
      epsLink.click()
      document.body.removeChild(epsLink)
      URL.revokeObjectURL(epsLink.href)
      
      toast.success("QR EPS descargado", {
        description: "El código QR EPS (sin logo) para diseñadores ha sido descargado exitosamente.",
      })
    } catch (error) {
      console.error('Error generando/descargando QR en EPS:', error)
      toast.error("Error al generar/descargar el QR EPS")
    }
  }

  const downloadLogoAI = async () => {
    try {
      // Abrir la URL directamente en una nueva pestaña para evitar problemas de CORS
      const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/logo%20Homestate.ai?alt=media&token=47b43834-b82f-4666-b10d-4da6fcc07f07'
      
      // Crear un enlace temporal y abrirlo en nueva pestaña
      const link = document.createElement('a')
      link.href = logoUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = 'logo-homestate.ai'
      
      // Agregar el enlace al DOM, hacer clic y remover
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Logo AI descargado", {
        description: "El logo en formato Adobe Illustrator ha sido abierto para descarga.",
      })
      
    } catch (error) {
      console.error('Error abriendo logo AI desde Firebase Storage:', error)
      
      // Fallback: abrir directamente en nueva pestaña
      try {
        window.open('https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/logo%20Homestate.ai?alt=media&token=47b43834-b82f-4666-b10d-4da6fcc07f07', '_blank')
        toast.info("Logo AI abierto", {
          description: "El logo se abrió en una nueva pestaña para descarga.",
        })
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError)
        toast.error("Error al abrir el logo AI")
      }
    }
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

            {/* Generar QR para Tally */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-gray-900">Código QR para Tally</h4>
              </div>
              
              <Button 
                onClick={generateTallyQR}
                disabled={!tallyLink.trim() || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generar QR del Link Tally
              </Button>

              {qrGenerated && (
                <div className="space-y-3">
                  {/* Vista previa del QR */}
                  <div className="flex justify-center">
                    <div className="p-3 bg-white border border-gray-300 rounded-lg">
                      <img 
                        src={qrDataUrl} 
                        alt="Código QR para formulario Tally"
                        className="w-32 h-32"
                      />
                    </div>
                  </div>

                  {/* Opciones de descarga */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Descargar en diferentes formatos:</p>
                    
                    <Button 
                      onClick={() => downloadTallyQR('png')} 
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PNG sin logo (folletería)
                    </Button>

                    <Button 
                      onClick={downloadTallyEPS} 
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      EPS sin logo (vectorizado)
                    </Button>

                    <Button 
                      onClick={downloadLogoAI} 
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Logo AI (solo logo)
                    </Button>
                  </div>
                </div>
              )}
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

      {/* Información sobre formatos QR */}
      {qrGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              Información sobre formatos de descarga QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">PNG sin Logo</h4>
                <p className="text-gray-600">
                  Código QR en color naranja mandarina sin logo central. 
                  Ideal para folletería digital, redes sociales y sitios web donde se prefiera un QR limpio.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">EPS sin Logo</h4>
                <p className="text-gray-600">
                  Código QR en formato PostScript vectorial completamente limpio, sin espacios reservados. 
                  Compatible con Adobe Illustrator, InDesign y software de diseño profesional.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">Logo AI</h4>
                <p className="text-gray-600">
                  Logo de HomEstate en formato Adobe Illustrator (.ai) para uso profesional. 
                  Disponible por separado para uso en otros materiales de diseño.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 