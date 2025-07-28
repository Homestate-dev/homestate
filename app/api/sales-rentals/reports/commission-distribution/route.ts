import { NextResponse } from 'next/server'
import { getCommissionDistributionReport, getCommissionDistributionSummary } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const agentId = searchParams.get('agentId')
    
    const agentIdNumber = agentId ? parseInt(agentId) : undefined
    
    if (agentId && isNaN(agentIdNumber!)) {
      return NextResponse.json(
        { success: false, error: 'ID de agente inválido' },
        { status: 400 }
      )
    }

    // Obtener el reporte detallado
    const distributionData = await getCommissionDistributionReport(startDate, endDate, agentIdNumber)
    
    // Obtener el resumen
    const summaryData = await getCommissionDistributionSummary(startDate, endDate, agentIdNumber)

    return NextResponse.json({
      success: true,
      data: {
        transactions: distributionData,
        summary: summaryData
      },
      filters: {
        startDate,
        endDate,
        agentId: agentIdNumber
      }
    })

  } catch (error) {
    console.error('Error al obtener reporte de comisiones distribuidas:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 