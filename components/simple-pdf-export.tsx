"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function SimplePDFExport() {
  const exportSimplePDF = async () => {
    try {
      toast.loading('Generando PDF...')
      
      // Cargar jsPDF de forma más simple
      const loadJsPDF = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          // Verificar si ya está cargado
          if (typeof window !== 'undefined' && (window as any).jsPDF) {
            resolve((window as any).jsPDF)
            return
          }
          
          // Cargar jsPDF desde CDN específico
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          script.onload = () => {
            // Esperar a que jsPDF esté disponible
            const checkJsPDF = () => {
              if ((window as any).jsPDF) {
                resolve((window as any).jsPDF)
              } else {
                setTimeout(checkJsPDF, 100)
              }
            }
            checkJsPDF()
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      
      // Cargar jsPDF
      const jsPDF = await loadJsPDF()
      
      // Crear documento PDF
      const doc = new jsPDF()
      
      // Configurar documento
      doc.setFont('helvetica')
      doc.setFontSize(20)
      
      // Título
      doc.text('Reporte de Transacciones', 20, 30)
      
      // Información
      doc.setFontSize(12)
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, 45)
      doc.text('Este es un reporte de prueba', 20, 55)
      
      // Tabla simple
      doc.setFontSize(10)
      doc.text('Edificio', 20, 80)
      doc.text('Departamento', 60, 80)
      doc.text('Tipo', 120, 80)
      doc.text('Valor', 160, 80)
      
      // Datos de ejemplo
      doc.text('Edificio A', 20, 90)
      doc.text('Depto 101', 60, 90)
      doc.text('Venta', 120, 90)
      doc.text('$250,000,000', 160, 90)
      
      doc.text('Edificio B', 20, 100)
      doc.text('Depto 202', 60, 100)
      doc.text('Arriendo', 120, 100)
      doc.text('$2,500,000', 160, 100)
      
      // Guardar PDF
      const fileName = `reporte_simple_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      // Mostrar éxito
      toast.dismiss()
      toast.success('PDF generado exitosamente')
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF')
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Exportar PDF Simple</h3>
      <p className="text-sm text-gray-600 mb-4">
        Esta es una versión simplificada para probar la funcionalidad de PDF
      </p>
      <Button onClick={exportSimplePDF} className="bg-green-600 hover:bg-green-700">
        <Download className="h-4 w-4 mr-2" />
        Generar PDF Simple
      </Button>
    </div>
  )
} 