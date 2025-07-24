import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // Query simple para verificar si hay datos
    const result = await query(`
      SELECT 
        td.id,
        td.tipo_transaccion,
        td.precio_final,
        td.fecha_transaccion,
        td.cliente_nombre,
        a.nombre as agente_nombre,
        e.nombre as edificio_nombre,
        d.numero as departamento_numero
      FROM transacciones_departamentos td
      LEFT JOIN administradores a ON td.agente_id = a.id
      LEFT JOIN departamentos d ON td.departamento_id = d.id
      LEFT JOIN edificios e ON d.edificio_id = e.id
      ORDER BY td.fecha_transaccion DESC
      LIMIT 5
    `)

    // Verificar que todos los campos sean válidos
    const safeData = result.rows.map(row => ({
      id: row.id || 0,
      tipo_transaccion: row.tipo_transaccion || '',
      precio_final: row.precio_final || 0,
      fecha_transaccion: row.fecha_transaccion ? new Date(row.fecha_transaccion).toISOString() : null,
      cliente_nombre: row.cliente_nombre || '',
      agente_nombre: row.agente_nombre || '',
      edificio_nombre: row.edificio_nombre || '',
      departamento_numero: row.departamento_numero || ''
    }))

    return NextResponse.json({
      success: true,
      data: safeData,
      count: safeData.length
    })

  } catch (error) {
    console.error('Error en test-transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener transacciones de prueba',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 