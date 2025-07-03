import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const sql = `
      SELECT 
        d.id,
        d.numero,
        d.nombre,
        d.piso,
        d.area,
        d.edificio_id,
        d.valor_venta,
        d.valor_arriendo,
        d.estado,
        d.disponible,
        d.tipo,
        d.cantidad_habitaciones,
        e.nombre as edificio_nombre,
        e.direccion as edificio_direccion
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      WHERE d.disponible = true
      ORDER BY e.nombre, d.piso, d.numero
    `

    const result = await query(sql)

    return NextResponse.json({
      success: true,
      data: result.rows || []
    })

  } catch (error) {
    console.error('Error al obtener departamentos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener departamentos' },
      { status: 500 }
    )
  }
} 