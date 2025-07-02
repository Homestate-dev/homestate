import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const sql = `
      SELECT 
        d.id,
        d.numero,
        d.edificio_id,
        d.precio_venta,
        d.precio_arriendo,
        d.estado,
        e.nombre as edificio_nombre,
        e.direccion as edificio_direccion
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      ORDER BY e.nombre, d.numero
    `

    const result = await query(sql)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('Error al obtener departamentos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener departamentos' },
      { status: 500 }
    )
  }
} 