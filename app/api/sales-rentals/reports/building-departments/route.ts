import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get('buildingId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!buildingId) {
      return NextResponse.json({ 
        success: false, 
        error: 'buildingId es requerido' 
      }, { status: 400 })
    }

    // Construir la consulta SQL con filtros de fecha
    let sql = `
      SELECT DISTINCT
        d.id as departamento_id,
        d.nombre as departamento_nombre,
        d.piso,
        d.numero,
        t.tipo_transaccion,
        t.valor_transaccion,
        t.comision_total,
        t.valor_admin_edificio,
        t.fecha_transaccion
      FROM departamentos d
      INNER JOIN transacciones_ventas_arriendos t ON d.id = t.departamento_id
      WHERE d.edificio_id = ?
    `

    const params: any[] = [buildingId]

    // Agregar filtros de fecha si están presentes
    if (dateFrom) {
      sql += ' AND DATE(t.fecha_transaccion) >= ?'
      params.push(dateFrom)
    }
    
    if (dateTo) {
      sql += ' AND DATE(t.fecha_transaccion) <= ?'
      params.push(dateTo)
    }

    // Ordenar por número de departamento ascendente
    sql += ' ORDER BY CAST(d.numero AS UNSIGNED) ASC'

    const results = await query(sql, params)

    if (!results || results.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'No se encontraron departamentos con transacciones para el edificio seleccionado'
      })
    }

    // Procesar los resultados para agrupar por departamento y calcular totales
    const departmentMap = new Map()

    results.forEach((row: any) => {
      const deptKey = row.departamento_id
      
      if (!departmentMap.has(deptKey)) {
        departmentMap.set(deptKey, {
          departamento_id: row.departamento_id,
          nombre: row.departamento_nombre,
          piso: row.piso,
          numero: row.numero,
          transacciones: []
        })
      }

      const dept = departmentMap.get(deptKey)
      dept.transacciones.push({
        tipo: row.tipo_transaccion,
        valor_transaccion: row.valor_transaccion,
        comision_total: row.comision_total,
        valor_admin_edificio: row.valor_admin_edificio,
        fecha: row.fecha_transaccion
      })
    })

    // Convertir el mapa a array y calcular totales por departamento
    const departments = Array.from(departmentMap.values()).map(dept => {
      const totalComision = dept.transacciones.reduce((sum: number, t: any) => 
        sum + (t.comision_total || 0), 0)
      const totalAdminEdificio = dept.transacciones.reduce((sum: number, t: any) => 
        sum + (t.valor_admin_edificio || 0), 0)
      
      // Determinar el tipo principal (si hay ventas, priorizar venta, sino arriendo)
      const hasVentas = dept.transacciones.some((t: any) => t.tipo === 'venta')
      const tipoPrincipal = hasVentas ? 'Venta' : 'Arriendo'

      return {
        ...dept,
        tipo_principal: tipoPrincipal,
        total_comision: totalComision,
        total_admin_edificio: totalAdminEdificio,
        cantidad_transacciones: dept.transacciones.length
      }
    })

    return NextResponse.json({
      success: true,
      data: departments
    })

  } catch (error) {
    console.error('Error al obtener departamentos del edificio:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
