// Utilidades para generación de PDF
export class PDFGenerator {
  private static jsPDF: any = null
  private static isLoading = false
  private static loadPromise: Promise<any> | null = null

  static async loadJsPDF(): Promise<any> {
    // Si ya está cargado, retornar
    if (this.jsPDF) {
      return this.jsPDF
    }

    // Si ya está cargando, retornar la promesa existente
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.isLoading = true
    this.loadPromise = new Promise((resolve, reject) => {
      // Timeout para evitar ciclos infinitos
      const timeout = setTimeout(() => {
        this.isLoading = false
        this.loadPromise = null
        reject(new Error('Timeout al cargar jsPDF'))
      }, 10000) // 10 segundos de timeout

      // Verificar si ya está disponible globalmente
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        this.jsPDF = (window as any).jsPDF
        this.isLoading = false
        this.loadPromise = null
        clearTimeout(timeout)
        resolve(this.jsPDF)
        return
      }

      // Cargar desde CDN
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      
      script.onload = () => {
        // Verificar que se cargó correctamente con timeout
        let attempts = 0
        const maxAttempts = 50 // 5 segundos máximo
        
        const checkLoaded = () => {
          attempts++
          if ((window as any).jsPDF) {
            this.jsPDF = (window as any).jsPDF
            this.isLoading = false
            this.loadPromise = null
            clearTimeout(timeout)
            resolve(this.jsPDF)
          } else if (attempts < maxAttempts) {
            setTimeout(checkLoaded, 100)
          } else {
            this.isLoading = false
            this.loadPromise = null
            clearTimeout(timeout)
            reject(new Error('jsPDF no se cargó después de múltiples intentos'))
          }
        }
        
        setTimeout(checkLoaded, 100)
      }

      script.onerror = () => {
        this.isLoading = false
        this.loadPromise = null
        clearTimeout(timeout)
        reject(new Error('No se pudo cargar jsPDF desde CDN'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
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
        const columnWidth = 35 // Reducido para mejor ajuste
        
        options.headers.forEach((header, index) => {
          doc.setFillColor(59, 130, 246)
          doc.setTextColor(255, 255, 255)
          doc.rect(xPosition, yPosition, columnWidth, 8, 'F')
          doc.text(header.substring(0, 10), xPosition + 2, yPosition + 6)
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
            const cellText = String(cell).substring(0, 10)
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