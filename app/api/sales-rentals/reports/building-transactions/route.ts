import { NextResponse } from 'next/server'
import { getBuildingTransactionsReport } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get('buildingId')
    
    const buildingIdNumber = buildingId ? parseInt(buildingId) : undefined
    
    if (buildingId && isNaN(buildingIdNumber!)) {
      return NextResponse.json(
        { success: false, error: 'ID de edificio inválido' },
        { status: 400 }
      )
    }

    const transactions = await getBuildingTransactionsReport(buildingIdNumber)

    return NextResponse.json({
      success: true,
      data: transactions,
      filters: {
        buildingId: buildingIdNumber
      }
    })

  } catch (error) {
    console.error('Error al obtener reporte de transacciones por edificio:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 