// Utilidades para generación de PDF
export class PDFGenerator {
  private static jsPDF: any = null
  private static isLoading = false

  static async loadJsPDF(): Promise<any> {
    // Si ya está cargado, retornar
    if (this.jsPDF) {
      return this.jsPDF
    }

    // Si está cargando, esperar
    if (this.isLoading) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.jsPDF) {
            resolve(this.jsPDF)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
      })
    }

    this.isLoading = true

    return new Promise((resolve, reject) => {
      // Verificar si ya está disponible globalmente
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        this.jsPDF = (window as any).jsPDF
        this.isLoading = false
        resolve(this.jsPDF)
        return
      }

      // Cargar desde CDN
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      
      script.onload = () => {
        // Verificar que se cargó correctamente
        const checkLoaded = () => {
          if ((window as any).jsPDF) {
            this.jsPDF = (window as any).jsPDF
            this.isLoading = false
            resolve(this.jsPDF)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
      }

      script.onerror = () => {
        this.isLoading = false
        reject(new Error('No se pudo cargar jsPDF'))
      }

      document.head.appendChild(script)
    })
  }

  static async createPDF(options: {
    title: string
    data: any[]
    headers: string[]
    fileName: string
  }) {
    try {
      const jsPDF = await this.loadJsPDF()
      
      // Crear documento
      const doc = new jsPDF()
      
      // Configurar documento
      doc.setFont('helvetica')
      doc.setFontSize(20)
      
      // Título
      doc.text(options.title, 20, 30)
      
      // Información
      doc.setFontSize(12)
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, 45)
      doc.text(`Total de registros: ${options.data.length}`, 20, 55)
      
      // Crear tabla simple
      if (options.data.length > 0) {
        let yPosition = 80
        doc.setFontSize(10)
        
        // Encabezados
        let xPosition = 20
        const columnWidth = 40
        
        options.headers.forEach((header, index) => {
          doc.setFillColor(59, 130, 246)
          doc.setTextColor(255, 255, 255)
          doc.rect(xPosition, yPosition, columnWidth, 8, 'F')
          doc.text(header.substring(0, 8), xPosition + 2, yPosition + 6)
          xPosition += columnWidth
        })
        
        // Datos
        yPosition += 10
        doc.setFillColor(255, 255, 255)
        doc.setTextColor(0, 0, 0)
        
        options.data.forEach((row, rowIndex) => {
          // Nueva página si es necesario
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }
          
          xPosition = 20
          row.forEach((cell: any, cellIndex: number) => {
            const cellText = String(cell).substring(0, 8)
            doc.text(cellText, xPosition + 2, yPosition + 6)
            xPosition += columnWidth
          })
          
          yPosition += 8
        })
      } else {
        doc.setFontSize(14)
        doc.text('No hay datos para mostrar', 20, 80)
      }
      
      // Guardar PDF
      doc.save(options.fileName)
      
      return true
    } catch (error) {
      console.error('Error al crear PDF:', error)
      throw error
    }
  }
} 