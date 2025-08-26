import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API building-departments called')
    console.log('🌐 Full URL received:', request.url)
    const { searchParams } = new URL(request.url)
    console.log('🔗 Search params object:', searchParams)
    console.log('🔗 Search params entries:', Array.from(searchParams.entries()))
    console.log('🔗 Search params keys:', Array.from(searchParams.keys()))
    console.log('🔗 Search params values:', Array.from(searchParams.values()))
    const buildingId = searchParams.get('buildingId')
    const transactionType = searchParams.get('transactionType')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    console.log('📋 Request parameters:', { buildingId, transactionType, dateFrom, dateTo })
    console.log('🔍 BuildingId type:', typeof buildingId)
    console.log('🔍 BuildingId value (raw):', buildingId)
    console.log('🔍 BuildingId value (parsed):', buildingId ? parseInt(buildingId) : 'null')
    console.log('🔍 BuildingId value (Number):', buildingId ? Number(buildingId) : 'null')
    console.log('⚠️ IMPORTANTE: Incluyendo solo transacciones con estados: promesa_compra_venta, firma_escrituras, firma_y_pago')

    if (!buildingId) {
      console.log('❌ No buildingId provided')
      return NextResponse.json({ 
        success: false, 
        error: 'buildingId es requerido' 
      }, { status: 400 })
    }

    // Construir la consulta SQL con filtros de fecha, tipo de transacción y estados válidos
    let sql = `
      SELECT DISTINCT
        d.id as departamento_id,
        d.nombre as departamento_nombre,
        d.piso,
        d.numero,
        t.tipo_transaccion,
        t.precio_final as valor_transaccion,
        t.comision_valor as comision_total,
        t.valor_admin_edificio,
        t.fecha_transaccion,
        t.estado_actual,
        t.datos_estado,
        t.fecha_ultimo_estado,
        CAST(d.numero AS INTEGER) as numero_orden
      FROM departamentos d
      INNER JOIN transacciones_departamentos t ON d.id = t.departamento_id
      WHERE d.edificio_id = $1
        AND t.estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')
    `

    const params: any[] = [buildingId]

    // Agregar filtro de tipo de transacción si está presente
    if (transactionType && transactionType !== 'all') {
      sql += ` AND t.tipo_transaccion = $${params.length + 1}`
      params.push(transactionType)
    }

    // Agregar filtros de fecha si están presentes
    if (dateFrom && dateTo) {
      sql += ` AND DATE(t.fecha_transaccion) >= $${params.length + 1}::DATE AND DATE(t.fecha_transaccion) <= $${params.length + 2}::DATE`
      params.push(dateFrom, dateTo)
    } else if (dateFrom) {
      sql += ` AND DATE(t.fecha_transaccion) >= $${params.length + 1}::DATE`
      params.push(dateFrom)
    } else if (dateTo) {
      sql += ` AND DATE(t.fecha_transaccion) <= $${params.length + 1}::DATE`
      params.push(dateTo)
    }

    // Ordenar por número de departamento ascendente
    sql += ' ORDER BY numero_orden ASC'

    console.log('SQL Query:', sql)
    console.log('Parameters:', params)
    console.log('Building ID:', buildingId)
    console.log('Date From:', dateFrom)
    console.log('Date To:', dateTo)
    console.log('Date From (parsed):', dateFrom ? new Date(dateFrom) : 'null')
    console.log('Date To (parsed):', dateTo ? new Date(dateTo) : 'null')
    console.log('Current date:', new Date().toISOString())

    // Primero hacer una consulta de prueba para ver qué hay en la base
    console.log('🔍 Executing test query to count transactions...')
    const testQuery = `
      SELECT COUNT(*) as total_transactions 
      FROM transacciones_departamentos t 
      INNER JOIN departamentos d ON d.id = t.departamento_id 
      WHERE d.edificio_id = $1
        AND t.estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')
    `
    console.log('📝 Test query:', testQuery)
    console.log('🔢 Test query params:', [buildingId])
    
    const testResult = await query(testQuery, [buildingId])
    console.log('✅ Test query result:', testResult)
    console.log('📊 Total transactions for building (no date filter):', testResult.rows[0]?.total_transactions)

    // Verificar si hay transacciones en absoluto para este edificio
    if (testResult.rows[0]?.total_transactions === 0) {
      console.log('⚠️ No transactions found for building. Starting diagnostic queries...')
      
      // Verificar si el edificio existe
      console.log('🏢 Checking if building exists...')
      const buildingQuery = `SELECT id, nombre FROM edificios WHERE id = $1`
      console.log('📝 Building query:', buildingQuery)
      const buildingResult = await query(buildingQuery, [buildingId])
      console.log('✅ Building query result:', buildingResult)
      console.log('🏢 Building exists:', buildingResult.rows.length > 0, buildingResult.rows[0])
      
      // Verificar si hay departamentos para este edificio
      console.log('🏠 Checking if building has departments...')
      const deptQuery = `SELECT COUNT(*) as total_depts FROM departamentos WHERE edificio_id = $1`
      console.log('📝 Department query:', deptQuery)
      const deptResult = await query(deptQuery, [buildingId])
      console.log('✅ Department query result:', deptResult)
      console.log('🏠 Total departments for building:', deptResult.rows[0]?.total_depts)
      
      // Verificar si hay transacciones en absoluto (sin filtros, solo estados válidos)
      console.log('💼 Checking total transactions in system (valid states only)...')
      const allTransQuery = `SELECT COUNT(*) as total_all FROM transacciones_departamentos WHERE estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')`
      console.log('📝 All transactions query:', allTransQuery)
      const allTransResult = await query(allTransQuery, [])
      console.log('✅ All transactions query result:', allTransResult)
      console.log('💼 Total transactions in system:', allTransResult.rows[0]?.total_all)
      
      // Verificar algunas transacciones de ejemplo para ver el formato de fecha
      console.log('📅 Checking sample transactions for date format...')
      const sampleTransQuery = `
        SELECT t.fecha_transaccion, t.tipo_transaccion, d.numero, d.edificio_id, t.estado_actual
        FROM transacciones_departamentos t 
        INNER JOIN departamentos d ON d.id = t.departamento_id 
        WHERE t.estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')
        LIMIT 3
      `
      console.log('📝 Sample transactions query:', sampleTransQuery)
      const sampleTransResult = await query(sampleTransQuery, [])
      console.log('✅ Sample transactions query result:', sampleTransResult)
      console.log('📅 Sample transactions from any building:', sampleTransResult.rows)
    }

    // Consulta adicional para ver el formato de las fechas
    const dateTestQuery = `
      SELECT t.fecha_transaccion, t.tipo_transaccion, d.numero, t.comision_valor, t.valor_admin_edificio, t.estado_actual, t.datos_estado
      FROM transacciones_departamentos t 
      INNER JOIN departamentos d ON d.id = t.departamento_id 
      WHERE d.edificio_id = $1
        AND t.estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')
      LIMIT 5
    `
    const dateTestResult = await query(dateTestQuery, [buildingId])
    console.log('Sample dates and transactions:', dateTestResult.rows)

    console.log('🎯 Executing main query with date filters...')
    console.log('📝 Main SQL:', sql)
    console.log('🔢 Main query params:', params)
    
    let results = await query(sql, params)
    
    console.log('✅ Main query result:', results)
    console.log('📊 Query results count:', results ? results.rows.length : 0)

        // Si no hay resultados con filtros de fecha, probar sin filtros
    if (!results || !results.rows || results.rows.length === 0) {
      console.log('⚠️ No results with date filters, trying fallback queries...')
      
      // Primero verificar si hay transacciones sin filtros de fecha
      console.log('🔍 Executing simple query without date filters...')
      const simpleQuery = `
        SELECT t.fecha_transaccion, t.tipo_transaccion, d.numero, d.edificio_id, t.estado_actual
        FROM transacciones_departamentos t 
        INNER JOIN departamentos d ON d.id = t.departamento_id 
        WHERE d.edificio_id = $1
          AND t.estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')
        ORDER BY t.fecha_transaccion DESC
        LIMIT 10
      `
      console.log('📝 Simple query:', simpleQuery)
      const simpleResult = await query(simpleQuery, [buildingId])
      console.log('✅ Simple query result:', simpleResult)
      console.log('📊 Simple query results (no date filters):', simpleResult.rows)
      
      console.log('🔍 Executing final fallback query without date filters...')
      const noDateSql = `
        SELECT DISTINCT
          d.id as departamento_id,
          d.nombre as departamento_nombre,
          d.piso,
          d.numero,
          t.tipo_transaccion,
          t.precio_final as valor_transaccion,
          t.comision_valor as comision_total,
          t.valor_admin_edificio,
          t.fecha_transaccion,
          t.estado_actual,
          t.datos_estado,
          t.fecha_ultimo_estado,
          CAST(d.numero AS INTEGER) as numero_orden
        FROM departamentos d
        INNER JOIN transacciones_departamentos t ON d.id = t.departamento_id
        WHERE d.edificio_id = $1
          AND t.estado_actual IN ('promesa_compra_venta', 'firma_escrituras', 'firma_y_pago')
        ORDER BY numero_orden ASC
      `
      console.log('📝 Final fallback query:', noDateSql)
      const noDateResults = await query(noDateSql, [buildingId])
      console.log('✅ Final fallback query result:', noDateResults)
      console.log('📊 No date filter results count:', noDateResults ? noDateResults.rows.length : 0)
      
      if (noDateResults && noDateResults.rows && noDateResults.rows.length > 0) {
        console.log('🎉 Found results without date filters, using those instead')
        results = noDateResults
      } else {
        console.log('❌ No results found even without date filters')
      }
    }

    if (!results || !results.rows || results.rows.length === 0) {
      console.log('❌ No results found in any query. Returning empty response.')
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'No se encontraron departamentos con transacciones para el edificio seleccionado'
      })
    }

    console.log('🎉 Final results found:', results.rows.length, 'rows')

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
      // Calcular la fecha según el estado actual de la transacción
      let fechaEstado = null
      try {
        const datosEstado = typeof row.datos_estado === 'string' ? JSON.parse(row.datos_estado) : row.datos_estado
        
        if (row.estado_actual === 'promesa_compra_venta') {
          // Para promesa de compraventa, usar la fecha del último estado
          fechaEstado = row.fecha_ultimo_estado
        } else if (row.estado_actual === 'firma_escrituras' && datosEstado?.fecha_firma) {
          // Para firma de escrituras, usar la fecha de firma del JSON
          fechaEstado = datosEstado.fecha_firma
        } else if (row.estado_actual === 'firma_y_pago' && datosEstado?.fecha) {
          // Para firma y pago (arriendo), usar la fecha del JSON
          fechaEstado = datosEstado.fecha
        } else {
          // Fallback a fecha del último estado
          fechaEstado = row.fecha_ultimo_estado
        }
      } catch (error) {
        console.error('Error parsing datos_estado:', error)
        fechaEstado = row.fecha_ultimo_estado
      }

      dept.transacciones.push({
        tipo: row.tipo_transaccion,
        valor_transaccion: row.valor_transaccion,
        comision_total: row.comision_total,
        valor_admin_edificio: row.valor_admin_edificio,
        fecha: row.fecha_transaccion,
        estado_actual: row.estado_actual,
        fecha_estado: fechaEstado
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

      // Obtener la fecha más reciente del estado
      const fechasEstado = dept.transacciones
        .map((t: any) => t.fecha_estado)
        .filter((fecha: any) => fecha !== null)
        .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())
      
      const fechaEstadoMasReciente = fechasEstado.length > 0 ? fechasEstado[0] : null

      return {
        ...dept,
        tipo_principal: tipoPrincipal,
        total_comision: totalComision,
        total_admin_edificio: totalAdminEdificio,
        cantidad_transacciones: dept.transacciones.length,
        fecha_estado: fechaEstadoMasReciente
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
