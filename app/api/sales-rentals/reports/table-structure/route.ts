import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('Checking table structure...')

    // 1. Verificar la estructura de la tabla transacciones_departamentos
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `
    const structureResult = await query(tableStructureQuery, [])
    console.log('Table structure:', structureResult.rows)

    // 2. Verificar si la tabla existe y tiene datos
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transacciones_departamentos'
      )
    `
    const existsResult = await query(tableExistsQuery, [])
    console.log('Table exists:', existsResult.rows[0])

    // 3. Verificar si hay datos en la tabla
    const countQuery = `SELECT COUNT(*) as total FROM transacciones_departamentos`
    const countResult = await query(countQuery, [])
    console.log('Total records:', countResult.rows[0])

    // 4. Verificar las primeras filas para entender la estructura
    const sampleQuery = `SELECT * FROM transacciones_departamentos LIMIT 3`
    const sampleResult = await query(sampleQuery, [])
    console.log('Sample data:', sampleResult.rows)

    return NextResponse.json({
      success: true,
      data: {
        structure: structureResult.rows,
        exists: existsResult.rows[0]?.exists,
        totalRecords: countResult.rows[0]?.total,
        sampleData: sampleResult.rows
      }
    })

  } catch (error) {
    console.error('Error checking table structure:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
