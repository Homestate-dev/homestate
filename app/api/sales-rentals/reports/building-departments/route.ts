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
        t.comision_valor as comision_total,
        t.valor_administracion as valor_admin_edificio,
        t.fecha_transaccion
      FROM departamentos d
      INNER JOIN transacciones_ventas_arriendos t ON d.id = t.departamento_id
      WHERE d.edificio_id = $1
    `

    const params: any[] = [buildingId]

    // Agregar filtros de fecha si están presentes
    if (dateFrom && dateTo) {
      sql += ` AND CAST(t.fecha_transaccion AS DATE) >= $${params.length + 1}::DATE AND CAST(t.fecha_transaccion AS DATE) <= $${params.length + 2}::DATE`
      params.push(dateFrom, dateTo)
    } else if (dateFrom) {
      sql += ` AND CAST(t.fecha_transaccion AS DATE) >= $${params.length + 1}::DATE`
      params.push(dateFrom)
    } else if (dateTo) {
      sql += ` AND CAST(t.fecha_transaccion AS DATE) <= $${params.length + 1}::DATE`
      params.push(dateTo)
    }

    // Ordenar por número de departamento ascendente
    sql += ' ORDER BY CAST(d.numero AS INTEGER) ASC'

    console.log('SQL Query:', sql)
    console.log('Parameters:', params)
    console.log('Building ID:', buildingId)
    console.log('Date From:', dateFrom)
    console.log('Date To:', dateTo)

    // Primero hacer una consulta de prueba para ver qué hay en la base
    const testQuery = `
      SELECT COUNT(*) as total_transactions 
      FROM transacciones_ventas_arriendos t 
      INNER JOIN departamentos d ON d.id = t.departamento_id 
      WHERE d.edificio_id = $1
    `
    const testResult = await query(testQuery, [buildingId])
    console.log('Total transactions for building (no date filter):', testResult.rows[0]?.total_transactions)

    // Consulta adicional para ver el formato de las fechas
    const dateTestQuery = `
      SELECT t.fecha_transaccion, t.tipo_transaccion, d.numero, t.comision_valor, t.valor_administracion
      FROM transacciones_ventas_arriendos t 
      INNER JOIN departamentos d ON d.id = t.departamento_id 
      WHERE d.edificio_id = $1
      LIMIT 5
    `
    const dateTestResult = await query(dateTestQuery, [buildingId])
    console.log('Sample dates and transactions:', dateTestResult.rows)

    let results = await query(sql, params)
    
    console.log('Query results count:', results ? results.rows.length : 0)

    // Si no hay resultados con filtros de fecha, probar sin filtros
    if (!results || !results.rows || results.rows.length === 0) {
      console.log('No results with date filters, trying without date filters...')
                           const noDateSql = `
          SELECT DISTINCT
            d.id as departamento_id,
            d.nombre as departamento_nombre,
            d.piso,
            d.numero,
            t.tipo_transaccion,
            t.valor_transaccion,
            t.comision_valor as comision_total,
            t.valor_administracion as valor_admin_edificio,
            t.fecha_transaccion
          FROM departamentos d
          INNER JOIN transacciones_ventas_arriendos t ON d.id = t.departamento_id
          WHERE d.edificio_id = $1
                     ORDER BY CAST(d.numero AS INTEGER) ASC
        `
      const noDateResults = await query(noDateSql, [buildingId])
      console.log('No date filter results count:', noDateResults ? noDateResults.rows.length : 0)
      
      if (noDateResults && noDateResults.rows && noDateResults.rows.length > 0) {
        console.log('Found results without date filters, using those instead')
        results = noDateResults
      }
    }

    if (!results || !results.rows || results.rows.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'No se encontraron departamentos con transacciones para el edificio seleccionado'
      })
    }

    // Procesar los resultados para agrupar por departamento y calcular totales
    const departmentMap = new Map()

    results.rows.forEach((row: any) => {
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
