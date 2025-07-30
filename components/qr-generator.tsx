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
      } else if (format === 'svg') {
        // Generar SVG con logo
        const svgWithLogo = await generateSVGWithLogo()
        const blob = new Blob([svgWithLogo], { type: 'image/svg+xml' })
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

  // Función para verificar si el logo existe
  const checkLogoExists = async (): Promise<boolean> => {
    try {
      const response = await fetch('/logo-qr.png', { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  // Función para vectorizar el logo PNG de manera más robusta
  const vectorizeLogo = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const logoImage = new Image()
      
      logoImage.onload = () => {
        // Crear canvas para analizar el logo
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'))
          return
        }

        // Configurar canvas con el tamaño del logo
        canvas.width = logoImage.width
        canvas.height = logoImage.height
        
        // Dibujar el logo en el canvas
        ctx.drawImage(logoImage, 0, 0)
        
        // Obtener los datos de imagen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Crear un patrón vectorial más inteligente
        let svgPaths = ''
        let hasContent = false
        
        // Analizar el logo de manera más inteligente
        const step = Math.max(1, Math.floor(canvas.width / 32)) // Muestrear de manera más inteligente
        
        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            const index = (y * canvas.width + x) * 4
            const r = data[index]
            const g = data[index + 1]
            const b = data[index + 2]
            const a = data[index + 3]
            
            // Si el píxel no es transparente y no es blanco
            if (a > 128 && (r < 250 || g < 250 || b < 250)) {
              hasContent = true
              
              // Calcular el tamaño del rectángulo basado en la intensidad
              const intensity = (r + g + b) / 3
              const size = Math.max(2, Math.min(6, 8 - (intensity / 40)))
              
              // Escalar las coordenadas
              const scaledX = (x / canvas.width) * 64
              const scaledY = (y / canvas.height) * 64
              
              // Crear un rectángulo más pequeño y preciso
              svgPaths += `<rect x="${scaledX}" y="${scaledY}" width="${size}" height="${size}" fill="rgb(${r},${g},${b})"/>`
            }
          }
        }
        
        if (!hasContent) {
          // Si no hay contenido, crear un patrón más elaborado
          svgPaths = `
            <circle cx="32" cy="32" r="20" fill="#FF6B35"/>
            <circle cx="32" cy="32" r="16" fill="white"/>
            <circle cx="32" cy="32" r="12" fill="#FF6B35"/>
            <circle cx="32" cy="32" r="8" fill="white"/>
            <circle cx="32" cy="32" r="4" fill="#FF6B35"/>
          `
        }
        
        resolve(svgPaths)
      }
      
      logoImage.onerror = () => {
        // Si no se puede cargar el logo, crear un patrón por defecto más elaborado
        const defaultPattern = `
          <circle cx="32" cy="32" r="20" fill="#FF6B35"/>
          <circle cx="32" cy="32" r="16" fill="white"/>
          <circle cx="32" cy="32" r="12" fill="#FF6B35"/>
          <circle cx="32" cy="32" r="8" fill="white"/>
          <circle cx="32" cy="32" r="4" fill="#FF6B35"/>
        `
        resolve(defaultPattern)
      }
      
      logoImage.src = '/logo-qr.png'
    })
  }

  // Función para generar SVG con logo vectorizado mejorado
  const generateSVGWithLogo = async (): Promise<string> => {
    const logoExists = await checkLogoExists()
    
    if (!logoExists) {
      console.warn('Logo no encontrado, generando SVG sin logo')
      return QRCodeLib.toString(qrUrl, {
        type: 'svg',
        width: 256,
        margin: 2,
        color: {
          dark: '#FF6B35',
          light: '#ffffff'
        }
      })
    }

    try {
      // Generar SVG base
      const svgString = await QRCodeLib.toString(qrUrl, {
        type: 'svg',
        width: 256,
        margin: 2,
        color: {
          dark: '#FF6B35', // Naranja mandarina
          light: '#ffffff'
        }
      })

      // Vectorizar el logo
      const vectorizedLogo = await vectorizeLogo()
      
      // Calcular el tamaño del logo (64x64 píxeles)
      const logoSize = 64
      const qrSize = 256
      const logoX = (qrSize - logoSize) / 2
      const logoY = (qrSize - logoSize) / 2

      // Crear círculo blanco para el fondo del logo
      const circleRadius = logoSize / 2 + 6
      const circleX = qrSize / 2
      const circleY = qrSize / 2

      // Insertar el logo vectorizado en el SVG con mejor posicionamiento
      const logoElement = `
        <circle cx="${circleX}" cy="${circleY}" r="${circleRadius}" fill="white"/>
        <g transform="translate(${logoX}, ${logoY})" width="${logoSize}" height="${logoSize}" viewBox="0 0 64 64">
          ${vectorizedLogo}
        </g>
      `

      // Insertar el logo después del primer <g> en el SVG
      const svgWithLogo = svgString.replace('</g>', `</g>${logoElement}`)
      return svgWithLogo
    } catch (error) {
      console.error('Error generando SVG con logo:', error)
      // Fallback: generar SVG sin logo
      return QRCodeLib.toString(qrUrl, {
        type: 'svg',
        width: 256,
        margin: 2,
        color: {
          dark: '#FF6B35',
          light: '#ffffff'
        }
      })
    }
  }

  const downloadVectorized = async () => {
    try {
      // Generar un SVG de alta calidad con logo para uso vectorizado
      const svgWithLogo = await generateSVGWithLogo()
      
      const blob = new Blob([svgWithLogo], { type: 'image/svg+xml' })
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
      // Verificar si el logo existe
      const logoExists = await checkLogoExists()
      
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

      // Solo agregar logo si existe
      if (logoExists) {
        // Calcular posición del logo en EPS
        const logoSize = Math.floor(moduleCount * 0.25) // 25% del tamaño del QR
        const logoStartX = Math.floor((moduleCount - logoSize) / 2)
        const logoStartY = Math.floor((moduleCount - logoSize) / 2)

        // Crear fondo circular blanco para el logo
        const centerX = quietZone + moduleCount / 2
        const centerY = total - (quietZone + moduleCount / 2)
        const circleRadius = logoSize / 2 + 2

        epsBody += `\n% Logo background circle (white)\n`
        epsBody += `1 1 1 setrgbcolor\n` // Color blanco
        epsBody += `${centerX} ${centerY} ${circleRadius} 0 360 arc\n`
        epsBody += `fill\n`

        // Generar logo vectorizado para EPS
        try {
          const vectorizedLogo = await vectorizeLogo()
          
          // Calcular posición del logo en EPS
          const logoX = quietZone + logoStartX
          const logoY = total - (quietZone + logoStartY + logoSize)
          
          // Convertir el SVG del logo a comandos PostScript mejorado
          epsBody += `\n% Logo vectorized pattern\n`
          
          // Extraer los rectángulos del SVG y convertirlos a PostScript
          const rectMatches = vectorizedLogo.match(/<rect[^>]*>/g)
          if (rectMatches && rectMatches.length > 0) {
            for (const rect of rectMatches) {
              // Extraer atributos del rectángulo
              const xMatch = rect.match(/x="([^"]*)"/)
              const yMatch = rect.match(/y="([^"]*)"/)
              const widthMatch = rect.match(/width="([^"]*)"/)
              const heightMatch = rect.match(/height="([^"]*)"/)
              const fillMatch = rect.match(/fill="([^"]*)"/)
              
              if (xMatch && yMatch && widthMatch && heightMatch && fillMatch) {
                const x = parseFloat(xMatch[1])
                const y = parseFloat(yMatch[1])
                const width = parseFloat(widthMatch[1])
                const height = parseFloat(heightMatch[1])
                const fill = fillMatch[1]
                
                // Convertir color RGB a PostScript
                let r = 0, g = 0, b = 0
                if (fill.startsWith('rgb(')) {
                  const rgbMatch = fill.match(/rgb\((\d+),(\d+),(\d+)\)/)
                  if (rgbMatch) {
                    r = parseInt(rgbMatch[1]) / 255
                    g = parseInt(rgbMatch[2]) / 255
                    b = parseInt(rgbMatch[3]) / 255
                  }
                } else if (fill === '#FF6B35') {
                  r = 1; g = 0.42; b = 0.21
                }
                
                // Escalar las coordenadas del logo
                const scale = logoSize / 64
                const epsX = logoX + (x * scale)
                const epsY = logoY + (y * scale)
                const epsWidth = width * scale
                const epsHeight = height * scale
                
                epsBody += `${r} ${g} ${b} setrgbcolor\n`
                epsBody += `${epsX} ${epsY} ${epsWidth} ${epsHeight} rectfill\n`
              }
            }
          } else {
            // Si no hay rectángulos, crear un patrón más elaborado
            const logoCenterX = logoX + logoSize / 2
            const logoCenterY = logoY + logoSize / 2
            
            // Crear un patrón de círculos concéntricos
            epsBody += `1 0.42 0.21 setrgbcolor\n` // Color naranja
            epsBody += `${logoCenterX} ${logoCenterY} ${logoSize/3} 0 360 arc\n`
            epsBody += `fill\n`
            epsBody += `1 1 1 setrgbcolor\n` // Color blanco
            epsBody += `${logoCenterX} ${logoCenterY} ${logoSize/4} 0 360 arc\n`
            epsBody += `fill\n`
            epsBody += `1 0.42 0.21 setrgbcolor\n` // Color naranja
            epsBody += `${logoCenterX} ${logoCenterY} ${logoSize/6} 0 360 arc\n`
            epsBody += `fill\n`
          }
        } catch (error) {
          console.error('Error vectorizando logo para EPS:', error)
          // Fallback: crear un patrón más elaborado
          const logoX = quietZone + logoStartX
          const logoY = total - (quietZone + logoStartY + logoSize)
          const logoCenterX = logoX + logoSize / 2
          const logoCenterY = logoY + logoSize / 2
          
          epsBody += `1 0.42 0.21 setrgbcolor\n` // Color naranja
          epsBody += `${logoCenterX} ${logoCenterY} ${logoSize/3} 0 360 arc\n`
          epsBody += `fill\n`
          epsBody += `1 1 1 setrgbcolor\n` // Color blanco
          epsBody += `${logoCenterX} ${logoCenterY} ${logoSize/4} 0 360 arc\n`
          epsBody += `fill\n`
          epsBody += `1 0.42 0.21 setrgbcolor\n` // Color naranja
          epsBody += `${logoCenterX} ${logoCenterY} ${logoSize/6} 0 360 arc\n`
          epsBody += `fill\n`
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

            {/* Información sobre el logo */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Logo Vectorizado Mejorado:</strong> El código QR incluirá automáticamente el logo de HomEstate vectorizado en el centro (64x64 píxeles)
              </p>
              <p className="text-xs text-blue-600">
                Para cambiar el logo, reemplaza el archivo: <code>/public/logo-qr.png</code>
              </p>
              <p className="text-xs text-orange-600 mt-1">
                <strong>Color:</strong> El QR se genera en color naranja mandarina (#FF6B35)
              </p>
              <p className="text-xs text-green-600 mt-1">
                <strong>Nuevo:</strong> Vectorización inteligente que preserva colores y detalles del logo original
              </p>
              <p className="text-xs text-purple-600 mt-1">
                <strong>Mejorado:</strong> SVG y EPS ahora incluyen el logo vectorizado con mejor calidad y posicionamiento
              </p>
              <p className="text-xs text-red-600 mt-1">
                <strong>Importante:</strong> Asegúrate de que el archivo <code>/public/logo-qr.png</code> existe para que el logo aparezca en todos los formatos.
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
              <h4 className="font-semibold text-blue-600 mb-2">PNG con Logo</h4>
              <p className="text-gray-600">
                Incluye el logo de HomEstate en el centro (64x64 píxeles) y QR en color naranja mandarina. Ideal para folletería digital, redes sociales y sitios web.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">SVG</h4>
              <p className="text-gray-600">
                Formato vectorial estándar con logo perfectamente centrado, escalable sin pérdida de calidad. Compatible con navegadores web y editores básicos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Vectorizado</h4>
              <p className="text-gray-600">
                SVG de alta resolución con logo centrado optimizado para impresión en gran formato y uso profesional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">EPS</h4>
              <p className="text-gray-600">
                Formato PostScript vectorial con QR en color naranja y logo visible, compatible con Adobe Illustrator, InDesign y software de diseño profesional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
