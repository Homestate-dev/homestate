"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function PDFExportTest() {
  const testExport = async () => {
    try {
      toast.loading('Generando PDF de prueba...')
      
      // Función para cargar jsPDF dinámicamente
      const loadJsPDF = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          // Verificar si ya está cargado
          if (typeof window !== 'undefined' && (window as any).jsPDF) {
            resolve((window as any).jsPDF)
            return
          }
          
          // Cargar jsPDF
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          script.onload = () => {
            // Cargar autoTable
            const autoTableScript = document.createElement('script')
            autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
            autoTableScript.onload = () => {
              resolve((window as any).jsPDF)
            }
            autoTableScript.onerror = reject
            document.head.appendChild(autoTableScript)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      
      // Cargar jsPDF
      const jsPDF = await loadJsPDF()
      
      // Crear el documento PDF
      const doc = new jsPDF()
      
      // Configurar el documento
      doc.setFont('helvetica')
      doc.setFontSize(20)
      
      // Título del reporte
      doc.text('Reporte de Prueba - Transacciones', 20, 30)
      
      // Información del reporte
      doc.setFontSize(12)
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 20, 45)
      doc.text('Este es un reporte de prueba para verificar la funcionalidad de exportar PDF', 20, 55)
      
      // Crear tabla de ejemplo
      const tableData = [
        ['Edificio A', 'Depto 101', 'Venta', 'Juan Pérez', 'Agente 1', '$250,000,000', '$7,500,000', '15/01/2024', 'Completada'],
        ['Edificio B', 'Depto 202', 'Arriendo', 'María García', 'Agente 2', '$2,500,000', '$75,000', '20/01/2024', 'En Proceso'],
        ['Edificio A', 'Depto 303', 'Venta', 'Carlos López', 'Agente 1', '$300,000,000', '$9,000,000', '25/01/2024', 'Reservado']
      ]
      
      const headers = [
        'Edificio',
        'Depto',
        'Tipo',
        'Cliente',
        'Agente',
        'Valor',
        'Comisión',
        'Fecha',
        'Estado'
      ]
      
      // Agregar tabla usando autoTable
      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 80,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      })
      
      // Guardar el PDF
      const fileName = `reporte_prueba_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      // Mostrar mensaje de éxito
      toast.dismiss()
      toast.success('PDF de prueba generado exitosamente')
      
    } catch (error) {
      console.error('Error al generar PDF de prueba:', error)
      toast.dismiss()
      toast.error('Error al generar el PDF de prueba. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Prueba de Exportación PDF</h3>
      <Button onClick={testExport} className="bg-blue-600 hover:bg-blue-700">
        <Download className="h-4 w-4 mr-2" />
        Generar PDF de Prueba
      </Button>
    </div>
  )
} 