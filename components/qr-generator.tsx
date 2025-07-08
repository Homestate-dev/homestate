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

  const generateQR = async () => {
    try {
      // Generar QR con la biblioteca qrcode
      const dataUrl = await QRCodeLib.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      setQrDataUrl(dataUrl)
      setQrGenerated(true)
    } catch (error) {
      console.error('Error generando QR:', error)
    }
  }

  const downloadQR = async (format: 'png' | 'svg') => {
    try {
      if (format === 'png') {
        // Descargar PNG
        const link = document.createElement('a')
        link.href = qrDataUrl
        link.download = `qr-${building.permalink}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (format === 'svg') {
        // Generar y descargar SVG
        const svgString = await QRCodeLib.toString(qrUrl, {
          type: 'svg',
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `qr-${building.permalink}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      }
    } catch (error) {
      console.error('Error descargando QR:', error)
    }
  }

  const downloadVectorized = async () => {
    try {
      // Generar un SVG de alta calidad para uso vectorizado
      const svgString = await QRCodeLib.toString(qrUrl, {
        type: 'svg',
        width: 512, // Mayor resolución para vectorizado
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `qr-vectorizado-${building.permalink}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error descargando QR vectorizado:', error)
    }
  }

  const downloadEPS = async () => {
    try {
      // Generar estructura QR y acceder a la matriz de módulos (bit matrix)
      // `QRCodeLib.create` está disponible tanto en navegador como node y no requiere canvas
      const qr = QRCodeLib.create(qrUrl, {
        errorCorrectionLevel: 'M' // suficiente para la mayoría de los casos y archivo más pequeño
      }) as any

      // Matriz booleana donde true = módulo negro
      const modules: boolean[][] = qr.modules
      const moduleCount = modules.length

      const quietZone = 4 // margen de módulos blancos alrededor
      const total = moduleCount + quietZone * 2

      const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0
%%Title: QR Code - ${building.permalink}
%%Creator: HomeState QR Generator
%%BoundingBox: 0 0 ${total} ${total}
%%Pages: 1
%%LanguageLevel: 2
%%EndComments

%%BeginProlog
/rect { newpath moveto dup 0 rlineto exch 0 exch rlineto neg 0 rlineto closepath fill } bind def
%%EndProlog

%%Page: 1 1
gsave
0 setgray
` // comenzamos con color negro

      let epsBody = ''

      // Recorremos la matriz incluyendo quiet zone
      for (let y = 0; y < total; y++) {
        for (let x = 0; x < total; x++) {
          const isQuiet = x < quietZone || y < quietZone || x >= quietZone + moduleCount || y >= quietZone + moduleCount
          if (isQuiet) continue

          if (modules[y - quietZone][x - quietZone]) {
            // invertimos coordenada Y para PostScript (origen abajo-izquierda)
            const psY = total - y - 1
            epsBody += `${x} ${psY} 1 rect\n`
          }
        }
      }

      const epsFooter = `grestore
showpage
%%EOF`

      const epsContent = epsHeader + epsBody + epsFooter

      const blob = new Blob([epsContent], { type: 'application/postscript' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `qr-${building.permalink}.eps`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error generando/descargando QR en EPS:', error)
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
                    PNG para folletería
                  </Button>

                  <Button 
                    onClick={() => downloadQR('svg')} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    SVG estándar
                  </Button>

                  <Button 
                    onClick={downloadVectorized} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Vectorizado (alta calidad)
                  </Button>

                  <Button 
                    onClick={downloadEPS} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    EPS para Adobe (vectorizado)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">PNG</h4>
              <p className="text-gray-600">
                Ideal para usar en folletería digital, redes sociales y sitios web. Formato rasterizado con buena calidad.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">SVG</h4>
              <p className="text-gray-600">
                Formato vectorial estándar, escalable sin pérdida de calidad. Compatible con navegadores web y editores básicos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Vectorizado</h4>
              <p className="text-gray-600">
                SVG de alta resolución optimizado para impresión en gran formato y uso profesional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">EPS</h4>
              <p className="text-gray-600">
                Formato PostScript vectorial compatible con Adobe Illustrator, InDesign y software de diseño profesional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
