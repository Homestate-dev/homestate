import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edificio_id = searchParams.get('edificio_id')

    let sql = `
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
    `

    const params: any[] = []

    if (edificio_id) {
      // Si se especifica un edificio, mostrar todos los departamentos de ese edificio
      sql += ` WHERE d.edificio_id = $1`
      params.push(edificio_id)
    } else {
      // Si no se especifica edificio, mostrar solo los disponibles
      sql += ` WHERE d.disponible = true`
    }

    sql += ` ORDER BY e.nombre, d.piso, d.numero`

    const result = await query(sql, params)

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