import { NextRequest, NextResponse } from 'next/server'
import { migrateAlicuotaColumns } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const result = await migrateAlicuotaColumns()
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error ejecutando migración:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor',
        message: 'Error al ejecutar la migración de columnas alicuota'
      },
      { status: 500 }
    )
  }
} 