"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface PDFExportProps {
  title: string
  data: any[][]
  headers: string[]
  fileName: string
}

export function ServerPDFExport({ title, data, headers, fileName }: PDFExportProps) {
  const exportPDF = async () => {
    try {
      toast.loading('Generando PDF...')
      
      // Llamar a la API del servidor
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          data,
          headers,
          fileName
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Crear un blob con el HTML
        const blob = new Blob([result.html], { type: 'text/html' })
        
        // Crear URL del blob
        const url = window.URL.createObjectURL(blob)
        
        // Crear enlace de descarga
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        
        // Limpiar
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.dismiss()
        toast.success('PDF generado exitosamente')
      } else {
        throw new Error(result.error || 'Error al generar PDF')
      }
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF: ' + error.message)
    }
  }

  return (
    <Button onClick={exportPDF} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exportar PDF
    </Button>
  )
} 