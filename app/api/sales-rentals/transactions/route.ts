import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

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

    let whereConditions = ['1=1']
    let queryParams: any[] = []
    let paramCount = 0

    // Filtro de búsqueda
    if (search) {
      paramCount++
      whereConditions.push(`(
        tv.cliente_nombre ILIKE $${paramCount} OR 
        e.nombre ILIKE $${paramCount} OR 
        d.numero ILIKE $${paramCount} OR 
        a.nombre ILIKE $${paramCount}
      )`)
      queryParams.push(`%${search}%`)
    }

    // Filtro de tipo
    if (type && type !== 'all') {
      paramCount++
      whereConditions.push(`tv.tipo_transaccion = $${paramCount}`)
      queryParams.push(type)
    }

    // Filtro de estado
    if (status && status !== 'all') {
      paramCount++
      whereConditions.push(`tv.estado = $${paramCount}`)
      queryParams.push(status)
    }

    // Filtro de agente
    if (agent && agent !== 'all') {
      paramCount++
      whereConditions.push(`tv.agente_id = $${paramCount}`)
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
      whereConditions.push(`tv.fecha_transaccion >= $${paramCount}`)
      queryParams.push(from)
    }

    if (to) {
      paramCount++
      whereConditions.push(`tv.fecha_transaccion <= $${paramCount}`)
      queryParams.push(to)
    }

    const sql = `
      SELECT 
        tv.*,
        a.nombre as agente_nombre,
        e.nombre as edificio_nombre,
        d.numero as departamento_numero
      FROM transacciones_ventas_arriendos tv
      LEFT JOIN agentes_inmobiliarios a ON tv.agente_id = a.id
      LEFT JOIN departamentos d ON tv.departamento_id = d.id
      LEFT JOIN edificios e ON d.edificio_id = e.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY tv.fecha_registro DESC
    `

    const result = await query(sql, queryParams)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('Error al obtener transacciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener transacciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validaciones básicas
    if (!data.departamento_id || !data.agente_id || !data.tipo_transaccion || !data.valor_transaccion || !data.cliente_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Verificar que el departamento no tenga una transacción activa del mismo tipo
    const existingTransaction = await query(
      'SELECT id FROM transacciones_ventas_arriendos WHERE departamento_id = $1 AND tipo_transaccion = $2 AND estado IN ($3, $4)',
      [data.departamento_id, data.tipo_transaccion, 'pendiente', 'en_proceso']
    )

    if (existingTransaction.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'El departamento ya tiene una transacción activa de este tipo' },
        { status: 400 }
      )
    }

    const sql = `
      INSERT INTO transacciones_ventas_arriendos (
        departamento_id, agente_id, tipo_transaccion, valor_transaccion, 
        comision_porcentaje, fecha_transaccion, fecha_firma_contrato,
        cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento,
        duracion_contrato_meses, deposito_garantia, valor_administracion,
        forma_pago, entidad_financiera, valor_credito, valor_inicial,
        estado, notas, referido_por, canal_captacion, fecha_primer_contacto, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `

    const result = await query(sql, [
      data.departamento_id,
      data.agente_id,
      data.tipo_transaccion,
      data.valor_transaccion,
      data.comision_porcentaje || 3.0,
      data.fecha_transaccion,
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
      data.estado || 'pendiente',
      data.notas || null,
      data.referido_por || null,
      data.canal_captacion || null,
      data.fecha_primer_contacto || null,
      data.observaciones || null
    ])

    // Si la transacción está completada, actualizar el estado del departamento
    if (data.estado === 'completada') {
      const newStatus = data.tipo_transaccion === 'venta' ? 'vendido' : 'arrendado'
      await query(
        'UPDATE departamentos SET estado = $1 WHERE id = $2',
        [newStatus, data.departamento_id]
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error al crear transacción:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear la transacción' },
      { status: 500 }
    )
  }
} 