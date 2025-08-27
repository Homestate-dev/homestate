import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get('buildingId')

    if (!buildingId) {
      return NextResponse.json({ 
        success: false, 
        error: 'buildingId es requerido' 
      }, { status: 400 })
    }

    console.log('Testing connection for building ID:', buildingId)

    // 1. Verificar que el edificio existe
    const buildingQuery = `SELECT id, nombre FROM edificios WHERE id = $1`
    const buildingResult = await query(buildingQuery, [buildingId])
    console.log('Building result:', buildingResult.rows)

    // 2. Verificar que hay departamentos para este edificio
    const deptQuery = `SELECT id, nombre, numero FROM departamentos WHERE edificio_id = $1`
    const deptResult = await query(deptQuery, [buildingId])
    console.log('Departments result:', deptResult.rows)

    // 3. Verificar que hay transacciones para estos departamentos
    const transQuery = `
      SELECT t.id, t.fecha_transaccion, t.tipo_transaccion, t.comision_total, t.valor_admin_edificio, d.numero
      FROM transacciones_departamentos t
      INNER JOIN departamentos d ON d.id = t.departamento_id
      WHERE d.edificio_id = $1
      ORDER BY t.fecha_transaccion DESC
      LIMIT 10
    `
    const transResult = await query(transQuery, [buildingId])
    console.log('Transactions result:', transResult.rows)

    // 4. Verificar el formato de las fechas
    const dateQuery = `
      SELECT 
        t.fecha_transaccion,
        pg_typeof(t.fecha_transaccion) as fecha_tipo,
        t.fecha_transaccion::text as fecha_texto
      FROM transacciones_departamentos t
      INNER JOIN departamentos d ON d.id = t.departamento_id
      WHERE d.edificio_id = $1
      LIMIT 3
    `
    const dateResult = await query(dateQuery, [buildingId])
    console.log('Date format result:', dateResult.rows)

    return NextResponse.json({
      success: true,
      data: {
        building: buildingResult.rows[0] || null,
        departments: deptResult.rows,
        transactions: transResult.rows,
        dateFormats: dateResult.rows
      }
    })

  } catch (error) {
    console.error('Error testing connection:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
