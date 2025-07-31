import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, data, headers, fileName } = body

    // Crear contenido HTML simple para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .total-row { background-color: #e5f3ff !important; font-weight: bold; }
            .total-row td { border-top: 2px solid #3b82f6; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
          </div>
          
          <div class="info">
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
            <p><strong>Total de registros:</strong> ${data.length - 1}</p>
          </div>
          
          ${data.length > 0 ? `
            <table>
              <thead>
                <tr>
                  ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map((row, index) => {
                  const isTotalRow = index === data.length - 1
                  const rowClass = isTotalRow ? 'total-row' : ''
                  return `
                    <tr class="${rowClass}">
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          ` : '<p>No hay datos para mostrar</p>'}
          
          <div class="footer">
            <p>Generado por HomeState - ${new Date().toLocaleDateString('es-CO')}</p>
          </div>
        </body>
      </html>
    `

    // Retornar el HTML como respuesta
    return NextResponse.json({
      success: true,
      html: htmlContent,
      fileName: fileName || 'reporte.pdf'
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al generar el PDF'
    }, { status: 500 })
  }
} 