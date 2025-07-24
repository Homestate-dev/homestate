import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edificio_id = searchParams.get('edificio_id')

    // Primero, verificar qué columnas existen en la tabla departamentos
    const columnsResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'departamentos'
      AND column_name IN ('area_total', 'area')
    `)
    
    const hasAreaTotal = columnsResult.rows.some(col => col.column_name === 'area_total')
    const hasArea = columnsResult.rows.some(col => col.column_name === 'area')
    
    // Determinar qué columna usar para el área
    const areaColumn = hasAreaTotal ? 'd.area_total' : hasArea ? 'd.area' : 'NULL'
    const areaAlias = hasAreaTotal ? 'area_total as area' : hasArea ? 'area' : 'NULL as area'

    let sql = `
      SELECT 
        d.id,
        d.numero,
        d.nombre,
        d.piso,
        ${areaColumn} as area,
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
      // Validar que edificio_id sea un número válido
      const edificioIdNum = parseInt(edificio_id)
      if (isNaN(edificioIdNum)) {
        return NextResponse.json({
          success: false,
          error: 'edificio_id debe ser un número válido'
        }, { status: 400 })
      }
      
      // Verificar que el edificio existe
      const buildingExists = await query('SELECT id FROM edificios WHERE id = $1', [edificioIdNum])
      if (buildingExists.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: `El edificio con ID ${edificioIdNum} no existe`
        }, { status: 404 })
      }
      
      // Si se especifica un edificio, mostrar todos los departamentos de ese edificio
      sql += ` WHERE d.edificio_id = $1`
      params.push(edificioIdNum)
    } else {
      // Si no se especifica edificio, mostrar solo los disponibles
      sql += ` WHERE d.disponible = true`
    }

    sql += ` ORDER BY e.nombre, d.piso, d.numero`

    console.log('Ejecutando query:', sql, 'con parámetros:', params)
    
    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows || [],
      metadata: {
        total: result.rows.length,
        areaColumn: hasAreaTotal ? 'area_total' : hasArea ? 'area' : 'none',
        filteredByBuilding: !!edificio_id
      }
    })

  } catch (error) {
    console.error('Error al obtener departamentos:', error)
    
    // Proporcionar más información sobre el error
    let errorMessage = 'Error al obtener departamentos'
    let errorDetails = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
} 