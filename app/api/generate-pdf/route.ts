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
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              page-break-after: avoid;
            }
            .header-content { 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              gap: 15px; 
            }
            .logo { 
              width: 64px; 
              height: 64px; 
            }
            .brand-text { 
              font-family: 'Poppins', sans-serif; 
              font-weight: 300; 
              font-size: 24px; 
              color: #3b82f6; 
            }
            .title { 
              margin-top: 10px; 
              font-size: 20px; 
              color: #333; 
            }
            .info { 
              margin-bottom: 20px; 
              page-break-after: avoid;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
              word-wrap: break-word;
            }
            th { 
              background-color: #3b82f6; 
              color: white; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f8f9fa; 
            }
            .total-row { 
              background-color: #e5f3ff !important; 
              font-weight: bold; 
            }
            .total-row td { 
              border-top: 2px solid #3b82f6; 
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 10px; 
              color: #666; 
              page-break-before: avoid;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <img src="/logo-qr.png" alt="Homestate Logo" class="logo">
              <div>
                <div class="brand-text">HomEstate</div>
                <div class="title">${title}</div>
              </div>
            </div>
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

    // Para generar PDF real, necesitamos usar una librería externa
    // Por ahora, vamos a usar una API externa que convierta HTML a PDF
    const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          }
        }
      })
    })

    if (!pdfResponse.ok) {
      throw new Error('Error al convertir HTML a PDF')
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    // Retornar el PDF como respuesta
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName.replace('.html', '.pdf')}"`,
      },
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al generar el PDF'
    }, { status: 500 })
  }
} 