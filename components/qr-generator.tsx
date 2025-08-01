"use client"

import { useState, useRef } from "react"
import { QrCode, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QRCodeLib from "qrcode"

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
  const [qrDataUrl, setQrDataUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const qrUrl = `https://homestate-17ca5a8016cd.herokuapp.com/edificio/${building.permalink}`

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

  const generateQR = async () => {
    try {
      // Generar QR con la biblioteca qrcode en color naranja mandarina
      const dataUrl = await QRCodeLib.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#FF6B35', // Naranja mandarina
          light: '#ffffff'
        }
      })
      
      // Combinar con logo si existe
      const qrWithLogo = await combineQRWithLogo(dataUrl)
      setQrDataUrl(qrWithLogo)
      setQrGenerated(true)
    } catch (error) {
      console.error('Error generando QR:', error)
    }
  }

  const downloadQR = async (format: 'png' | 'svg') => {
    try {
      if (format === 'png') {
        // Descargar PNG con logo
        const link = document.createElement('a')
        link.href = qrDataUrl
        link.download = `qr-${building.permalink}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error descargando QR:', error)
    }
  }

  // Función para verificar si el logo existe
  const checkLogoExists = async (): Promise<boolean> => {
    try {
      const response = await fetch('/logo-qr.png', { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const downloadEPS = async () => {
    try {
      // Generar estructura QR y acceder a la matriz de módulos (bit matrix)
      const qr = QRCodeLib.create(qrUrl, {
        errorCorrectionLevel: 'M'
      }) as any

      const bitMatrix = qr.modules
      const moduleCount: number = bitMatrix.size || bitMatrix.length

      const quietZone = 4
      const total = moduleCount + quietZone * 2

      const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0
%%Title: QR Code - ${building.permalink}
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

      // Dibujar el QR en color naranja
      epsBody += `% QR Code in orange color\n`
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

      // Crear fondo circular blanco para el logo (sin logo dentro)
      const logoSize = Math.floor(moduleCount * 0.25) // 25% del tamaño del QR
      const centerX = quietZone + moduleCount / 2
      const centerY = total - (quietZone + moduleCount / 2)
      const circleRadius = logoSize / 2 + 2

      epsBody += `\n% Logo background circle (white) - sin logo\n`
      epsBody += `1 1 1 setrgbcolor\n` // Color blanco
      epsBody += `${centerX} ${centerY} ${circleRadius} 0 360 arc\n`
      epsBody += `fill\n`

      const epsFooter = `grestore
showpage
%%EOF`

      const epsContent = epsHeader + epsBody + epsFooter

      // Descargar el archivo EPS
      const epsBlob = new Blob([epsContent], { type: 'application/postscript' })
      const epsLink = document.createElement('a')
      epsLink.href = URL.createObjectURL(epsBlob)
      epsLink.download = `qr-${building.permalink}.eps`
      document.body.appendChild(epsLink)
      epsLink.click()
      document.body.removeChild(epsLink)
      URL.revokeObjectURL(epsLink.href)
    } catch (error) {
      console.error('Error generando/descargando QR en EPS:', error)
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
      
    } catch (error) {
      console.error('Error abriendo logo AI desde Firebase Storage:', error)
      
      // Fallback: abrir directamente en nueva pestaña
      try {
        window.open('https://firebasestorage.googleapis.com/v0/b/homestate-web.firebasestorage.app/o/logo%20Homestate.ai?alt=media&token=47b43834-b82f-4666-b10d-4da6fcc07f07', '_blank')
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generador de Código QR</h2>
        <p className="text-gray-600">Genera y descarga códigos QR para el edificio {building.nombre}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del edificio */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Edificio</CardTitle>
            <CardDescription>Datos del edificio para el código QR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{building.nombre}</h3>
              <p className="text-sm text-gray-600">{building.direccion}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">El código QR dirigirá a:</p>
              <p className="text-sm font-mono bg-white p-2 rounded border">
                homestate-17ca5a8016cd.herokuapp.com/edificio/{building.permalink}
              </p>
            </div>

            {/* Información sobre el logo */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Formatos disponibles:</strong> PNG con logo integrado, EPS con espacio blanco para diseñador, y logo AI separado.
              </p>
              <p className="text-xs text-blue-600">
                El diseñador de la imprenta puede usar el EPS con espacio blanco y el logo AI por separado.
              </p>
              <p className="text-xs text-orange-600 mt-1">
                <strong>Color:</strong> El QR se genera en color naranja mandarina (#FF6B35)
              </p>
              <p className="text-xs text-green-600 mt-1">
                <strong>Logo AI:</strong> Descarga el logo de HomEstate en formato Adobe Illustrator (.ai) para uso profesional.
              </p>
            </div>

            <Button onClick={generateQR} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <QrCode className="h-4 w-4 mr-2" />
              Generar Código QR
            </Button>
          </CardContent>
        </Card>

        {/* Vista previa y descarga */}
        <Card>
          <CardHeader>
            <CardTitle>Código QR</CardTitle>
            <CardDescription>
              {qrGenerated ? "Tu código QR está listo para descargar" : "Genera un código QR para comenzar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrGenerated ? (
              <div className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                    <img 
                      src={qrDataUrl} 
                      alt={`Código QR para ${building.nombre}`}
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* Opciones de descarga */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Descargar en diferentes formatos:</h4>
                  
                  <Button 
                    onClick={() => downloadQR('png')} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PNG con logo (folletería)
                  </Button>

                  <Button 
                    onClick={downloadEPS} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    EPS para Adobe (vectorizado)
                  </Button>

                  <Button 
                    onClick={downloadLogoAI} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Logo AI (solo logo)
                  </Button>
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

      {/* Información sobre formatos */}
      <Card>
        <CardHeader>
          <CardTitle>Información sobre formatos de descarga</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">PNG con Logo</h4>
              <p className="text-gray-600">
                Incluye el logo de HomEstate en el centro (64x64 píxeles) y QR en color naranja mandarina. Ideal para folletería digital, redes sociales y sitios web.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">EPS</h4>
              <p className="text-gray-600">
                Código QR en formato PostScript vectorial con área circular blanca en el centro (para que el diseñador coloque el logo). Compatible con Adobe Illustrator, InDesign y software de diseño profesional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Logo AI</h4>
              <p className="text-gray-600">
                Logo de HomEstate en formato Adobe Illustrator (.ai) para uso profesional. El diseñador puede usar este archivo junto con el EPS para crear el QR final.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
