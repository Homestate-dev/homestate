import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Verificar si las columnas ya existen
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'departamentos' 
      AND column_name IN ('alicuota', 'incluye_alicuota')
    `
    const checkResult = await executeQuery(checkQuery)
    
    if (checkResult.rows.length >= 2) {
      return NextResponse.json({ 
        success: true, 
        message: 'Las columnas alicuota e incluye_alicuota ya existen',
        existingColumns: checkResult.rows
      })
    }

    // Ejecutar la migración
    const migrationQueries = [
      `ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS alicuota INTEGER DEFAULT 0`,
      `ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS incluye_alicuota BOOLEAN DEFAULT false`,
      `CREATE INDEX IF NOT EXISTS idx_departamentos_alicuota ON departamentos(alicuota)`
    ]

    const results = []
    for (const query of migrationQueries) {
      try {
        const result = await executeQuery(query)
        results.push({ query, success: true, result: result.command || 'OK' })
      } catch (error: any) {
        results.push({ query, success: false, error: error.message })
      }
    }

    // Verificar que las columnas se crearon correctamente
    const verificationQuery = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'departamentos' 
      AND column_name IN ('alicuota', 'incluye_alicuota')
      ORDER BY column_name
    `
    const verificationResult = await executeQuery(verificationQuery)

    return NextResponse.json({
      success: true,
      message: 'Migración ejecutada exitosamente',
      migrationResults: results,
      newColumns: verificationResult.rows
    })

  } catch (error: any) {
    console.error('Error ejecutando migración:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor',
        details: 'Error al ejecutar la migración de columnas alicuota'
      },
      { status: 500 }
    )
  }
} 