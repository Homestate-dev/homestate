import { NextResponse } from 'next/server'
import { query, logAdminAction } from '@/lib/database'

// Función auxiliar para verificar si la columna es_agente existe
async function checkColumnExists(): Promise<boolean> {
  try {
    const result = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'administradores' AND column_name = 'es_agente'
    `)
    return result.rows.length > 0
  } catch (error) {
    console.warn('Error checking column existence:', error)
    return false
  }
}

// Helper: verifica si una tabla existe en la BD
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const res = await query(
      `SELECT EXISTS (
         SELECT 1
         FROM   information_schema.tables
         WHERE  table_name = $1
       ) AS exists`,
      [tableName]
    )
    return res.rows[0]?.exists === true
  } catch (error) {
    console.warn(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const agent = searchParams.get('agent') || 'all'
    const building = searchParams.get('building') || 'all'
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    // Verificar qué tabla de transacciones existe
    const hasTransaccionesDepartamentos = await tableExists('transacciones_departamentos')
    const hasTransaccionesVentasArriendos = await tableExists('transacciones_ventas_arriendos')
    
    if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
      return NextResponse.json({
        success: false,
        error: 'No se encontró tabla de transacciones'
      }, { status: 500 })
    }

    // Usar la tabla que existe
    const tableName = hasTransaccionesDepartamentos ? 'transacciones_departamentos' : 'transacciones_ventas_arriendos'
    const tableAlias = hasTransaccionesDepartamentos ? 'td' : 'tv'

    let whereConditions = ['1=1']
    let queryParams: any[] = []
    let paramCount = 0

    // Filtro de búsqueda
    if (search) {
      paramCount++
      whereConditions.push(`(
        ${tableAlias}.cliente_nombre ILIKE $${paramCount} OR 
        e.nombre ILIKE $${paramCount} OR 
        d.numero ILIKE $${paramCount} OR 
        a.nombre ILIKE $${paramCount}
      )`)
      queryParams.push(`%${search}%`)
    }

    // Filtro de tipo
    if (type && type !== 'all') {
      paramCount++
      whereConditions.push(`${tableAlias}.tipo_transaccion = $${paramCount}`)
      queryParams.push(type)
    }

    // Filtro de estado
    if (status && status !== 'all') {
      paramCount++
      whereConditions.push(`${tableAlias}.estado_actual = $${paramCount}`)
      queryParams.push(status)
    }

    // Filtro de agente
    if (agent && agent !== 'all') {
      paramCount++
      whereConditions.push(`${tableAlias}.agente_id = $${paramCount}`)
      queryParams.push(parseInt(agent))
    }

    // Filtro de edificio
    if (building && building !== 'all') {
      paramCount++
      whereConditions.push(`e.id = $${paramCount}`)
      queryParams.push(parseInt(building))
    }

    // Filtro de fechas
    if (from) {
      paramCount++
      whereConditions.push(`CAST(${tableAlias}.fecha_transaccion AS DATE) >= $${paramCount}`)
      queryParams.push(from)
    }

    if (to) {
      paramCount++
      whereConditions.push(`CAST(${tableAlias}.fecha_transaccion AS DATE) <= $${paramCount}`)
      queryParams.push(to)
    }

    const hasEsAgenteColumn = await checkColumnExists()
    const agentFilter = hasEsAgenteColumn ? 'AND a.es_agente = true' : ''

    const sql = `
      SELECT 
        ${tableAlias}.*,
        a.nombre as agente_nombre,
        e.nombre as edificio_nombre,
        d.numero as departamento_numero
      FROM ${tableName} ${tableAlias}
      LEFT JOIN administradores a ON ${tableAlias}.agente_id = a.id ${agentFilter}
      LEFT JOIN departamentos d ON ${tableAlias}.departamento_id = d.id
      LEFT JOIN edificios e ON d.edificio_id = e.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${tableAlias}.fecha_transaccion DESC
    `

    console.log('Ejecutando query de transacciones:', sql, 'con parámetros:', queryParams)
    
    const result = await query(sql, queryParams)

    // Sanitizar los datos para evitar errores en el frontend
    const safeData = result.rows.map(row => {
      const safeRow: any = {}
      
      // Copiar todas las propiedades y asegurar que no sean undefined
      Object.keys(row).forEach(key => {
        const value = row[key]
        if (value === null || value === undefined) {
          safeRow[key] = key.includes('fecha') ? null : (key.includes('valor') || key.includes('precio') || key.includes('comision') ? 0 : '')
        } else if (typeof value === 'object' && value instanceof Date) {
          safeRow[key] = value.toISOString()
        } else {
          safeRow[key] = value
        }
      })
      
      // Mapear precio_final a valor_transaccion para compatibilidad con el frontend
      if (row.precio_final !== undefined) {
        safeRow.valor_transaccion = row.precio_final
      }
      
      // Agregar campos faltantes para compatibilidad con el frontend
      if (!safeRow.cliente_nombre) {
        safeRow.cliente_nombre = 'Cliente no especificado'
      }
      if (!safeRow.cliente_email) {
        safeRow.cliente_email = null
      }
      if (!safeRow.cliente_telefono) {
        safeRow.cliente_telefono = null
      }
      if (!safeRow.cliente_cedula) {
        safeRow.cliente_cedula = null
      }
      if (!safeRow.fecha_transaccion) {
        safeRow.fecha_transaccion = row.fecha_registro || null
      }
      if (!safeRow.comision_valor) {
        safeRow.comision_valor = row.comision_agente || 0
      }
      
      return safeRow
    })

    return NextResponse.json({
      success: true,
      data: safeData
    })

  } catch (error) {
    console.error('Error al obtener transacciones:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener transacciones',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Debug: Log de los datos recibidos
    console.log('Datos recibidos en API:', {
      cliente_nombre: data.cliente_nombre,
      cliente_email: data.cliente_email,
      cliente_telefono: data.cliente_telefono,
      cliente_cedula: data.cliente_cedula,
      cliente_tipo_documento: data.cliente_tipo_documento,
      valor_transaccion: data.valor_transaccion,
      tipo_transaccion: data.tipo_transaccion
    })
    
    // Debug: Log completo de los datos
    console.log('Datos completos recibidos:', JSON.stringify(data, null, 2))

    // Validaciones básicas
    if (!data.departamento_id || !data.agente_id || !data.tipo_transaccion || !data.valor_transaccion) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Debug: Log de validación
    console.log('Validación de datos del cliente:', {
      cliente_nombre: data.cliente_nombre,
      cliente_email: data.cliente_email,
      cliente_telefono: data.cliente_telefono,
      cliente_cedula: data.cliente_cedula,
      cliente_tipo_documento: data.cliente_tipo_documento
    })

    // Validar autenticación
    if (!data.currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Verificar qué tabla de transacciones existe
    const hasTransaccionesDepartamentos = await tableExists('transacciones_departamentos')
    const hasTransaccionesVentasArriendos = await tableExists('transacciones_ventas_arriendos')
    
    if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
      return NextResponse.json({
        success: false,
        error: 'No se encontró tabla de transacciones'
      }, { status: 500 })
    }

    // Usar la tabla que existe
    const tableName = hasTransaccionesDepartamentos ? 'transacciones_departamentos' : 'transacciones_ventas_arriendos'
    
    // Validar cliente_nombre solo si se usa la tabla antigua (transacciones_ventas_arriendos)
    if (tableName === 'transacciones_ventas_arriendos' && !data.cliente_nombre) {
      return NextResponse.json(
        { success: false, error: 'Falta el nombre del cliente' },
        { status: 400 }
      )
    }

    // Verificar que el departamento no tenga una transacción activa del mismo tipo
    const existingTransaction = await query(
      `SELECT id FROM ${tableName} WHERE departamento_id = $1 AND tipo_transaccion = $2 AND estado_actual IN ($3, $4)`,
      [data.departamento_id, data.tipo_transaccion, 'reservado', 'promesa_compra_venta']
    )

    if (existingTransaction.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'El departamento ya tiene una transacción activa de este tipo' },
        { status: 400 }
      )
    }

    // Construir la query según la tabla que existe
    let sql: string
    let queryParams: any[]

    if (hasTransaccionesDepartamentos) {
      // Usar la nueva tabla con campos de comisiones
      sql = `
        INSERT INTO transacciones_departamentos (
          departamento_id, agente_id, tipo_transaccion, precio_final, precio_original,
          comision_agente, comision_porcentaje, comision_valor,
          porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
          valor_homestate, valor_bienes_raices, valor_admin_edificio,
          cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento,
          notas, fecha_transaccion, estado_actual, datos_estado, fecha_ultimo_estado, fecha_registro, creado_por
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        RETURNING *
      `
      
      const comisionPorcentaje = data.comision_porcentaje || 3.0
      const valorTransaccion = parseFloat(data.valor_transaccion) || 0
      const comisionValor = data.tipo_transaccion === 'venta' 
        ? (valorTransaccion * comisionPorcentaje) / 100 
        : (parseFloat(data.comision_valor) || 0)
      
      const porcentajeHomestate = data.porcentaje_homestate || 60
      const porcentajeBienesRaices = data.porcentaje_bienes_raices || 30
      const porcentajeAdminEdificio = data.porcentaje_admin_edificio || 10
      
      const valorHomestate = (comisionValor * porcentajeHomestate) / 100
      const valorBienesRaices = (comisionValor * porcentajeBienesRaices) / 100
      const valorAdminEdificio = (comisionValor * porcentajeAdminEdificio) / 100

      // Asegurar que los datos del cliente se procesen correctamente
      const clienteNombre = data.cliente_nombre || null
      const clienteEmail = data.cliente_email || null
      const clienteTelefono = data.cliente_telefono || null
      const clienteCedula = data.cliente_cedula || null
      const clienteTipoDocumento = data.cliente_tipo_documento || 'CC'
      
      queryParams = [
        data.departamento_id,
        data.agente_id,
        data.tipo_transaccion,
        valorTransaccion, // Este es el valor de la transacción
        data.precio_original || null,
        comisionValor,
        comisionPorcentaje,
        comisionValor,
        porcentajeHomestate,
        porcentajeBienesRaices,
        porcentajeAdminEdificio,
        valorHomestate,
        valorBienesRaices,
        valorAdminEdificio,
        clienteNombre,
        clienteEmail,
        clienteTelefono,
        clienteCedula,
        clienteTipoDocumento,
        data.notas || null,
        data.fecha_transaccion || new Date().toISOString(),
        data.estado_actual || 'reservado',
        data.datos_estado || '{}',
        new Date().toISOString(),
        data.fecha_registro || new Date().toISOString().split('T')[0],
        data.currentUserUid || 'system'
      ]
      
      // Debug: Log de los parámetros que se van a insertar
      console.log('Parámetros de inserción (datos del cliente):', {
        cliente_nombre: data.cliente_nombre || null,
        cliente_email: data.cliente_email || null,
        cliente_telefono: data.cliente_telefono || null,
        cliente_cedula: data.cliente_cedula || null,
        cliente_tipo_documento: data.cliente_tipo_documento || 'CC'
      })
      
      // Debug: Log de todos los parámetros
      console.log('Todos los parámetros de inserción:', queryParams)
      
      // Debug: Log de las variables explícitas
      console.log('Variables explícitas del cliente:', {
        clienteNombre,
        clienteEmail,
        clienteTelefono,
        clienteCedula,
        clienteTipoDocumento
      })
      
      // Debug: Log de la consulta SQL
      console.log('🔍 Consulta SQL a ejecutar:')
      console.log(sql)
      console.log('📋 Parámetros de la consulta:')
      console.log(queryParams.map((param, index) => `${index + 1}: ${param}`).join('\n'))
    } else {
      // Usar la tabla antigua
      sql = `
        INSERT INTO transacciones_ventas_arriendos (
          departamento_id, agente_id, tipo_transaccion, valor_transaccion, 
          comision_porcentaje, fecha_transaccion, fecha_registro, fecha_firma_contrato,
          cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento,
          duracion_contrato_meses, deposito_garantia, valor_administracion,
          forma_pago, entidad_financiera, valor_credito, valor_inicial,
          estado_actual, notas, referido_por, canal_captacion, fecha_primer_contacto, observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        RETURNING *
      `

      queryParams = [
        data.departamento_id,
        data.agente_id,
        data.tipo_transaccion,
        valorTransaccion,
        data.comision_porcentaje || 3.0,
        data.fecha_transaccion,
        data.fecha_registro || new Date().toISOString().split('T')[0],
        data.fecha_firma_contrato || null,
        data.cliente_nombre,
        data.cliente_email || null,
        data.cliente_telefono || null,
        data.cliente_cedula || null,
        data.cliente_tipo_documento || 'CC',
        data.duracion_contrato_meses || null,
        data.deposito_garantia || null,
        data.valor_administracion || null,
        data.forma_pago || null,
        data.entidad_financiera || null,
        data.valor_credito || null,
        data.valor_inicial || null,
        data.estado_actual || 'reservado',
        data.notas || null,
        data.referido_por || null,
        data.canal_captacion || null,
        data.fecha_primer_contacto || null,
        data.observaciones || null
      ]
    }

    const result = await query(sql, queryParams)

    // Si la transacción está completada, actualizar el estado del departamento
    if (data.estado_actual === 'completada') {
      const newStatus = data.tipo_transaccion === 'venta' ? 'vendido' : 'arrendado'
      await query(
        'UPDATE departamentos SET estado = $1 WHERE id = $2',
        [newStatus, data.departamento_id]
      )
    }

    // Registrar la actividad
    try {
      const hasEsAgenteColumn = await checkColumnExists()
      const agentFilter = hasEsAgenteColumn ? 'AND a.es_agente = true' : ''
      
      const transactionInfo = await query(`
        SELECT 
          d.numero as departamento_numero,
          d.nombre as departamento_nombre,
          e.nombre as edificio_nombre,
          a.nombre as agente_nombre
        FROM departamentos d
        JOIN edificios e ON d.edificio_id = e.id
        JOIN administradores a ON a.id = $2 ${agentFilter}
        WHERE d.id = $1
      `, [data.departamento_id, data.agente_id])

      if (transactionInfo.rows.length > 0) {
        const info = transactionInfo.rows[0]
        const tipoDisplay = data.tipo_transaccion === 'venta' ? 'venta' : 'arriendo'
        const valorFormatted = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(data.valor_transaccion)

        await logAdminAction(
          data.currentUserUid,
          `Creó nueva transacción de ${tipoDisplay}: Depto ${info.departamento_numero} en ${info.edificio_nombre} por ${valorFormatted} con agente ${info.agente_nombre}`,
          'creación',
          { 
            transaccion_id: result.rows[0].id,
            tipo_transaccion: data.tipo_transaccion,
            departamento_id: data.departamento_id,
            agente_id: data.agente_id,
            valor_transaccion: data.valor_transaccion,
            cliente_nombre: data.cliente_nombre,
            edificio_nombre: info.edificio_nombre,
            departamento_numero: info.departamento_numero,
            agente_nombre: info.agente_nombre
          }
        )
      }
    } catch (logError) {
      console.warn('Error al registrar actividad de transacción:', logError)
      // No fallar por esto, es opcional
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error al crear transacción:', error)
    console.error('Stack trace:', error.stack)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la transacción',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
} 