import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET: Obtener el estado actual de una transacción
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID de transacción requerido' },
        { status: 400 }
      )
    }

    const result = await query(`
      SELECT 
        t.id,
        t.tipo_transaccion,
        t.estado_actual,
        t.datos_estado,
        t.fecha_ultimo_estado,
        t.cliente_nombre,
        t.precio_final,
        d.numero as departamento_numero,
        e.nombre as edificio_nombre,
        a.nombre as agente_nombre
      FROM transacciones_departamentos t
      LEFT JOIN departamentos d ON t.departamento_id = d.id
      LEFT JOIN edificios e ON d.edificio_id = e.id
      LEFT JOIN administradores a ON t.agente_id = a.id
      WHERE t.id = $1
    `, [transactionId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    const transaction = result.rows[0]

    // Obtener historial de estados
    const historialResult = await query(`
      SELECT 
        estado_anterior,
        estado_nuevo,
        fecha_cambio,
        motivo_cambio,
        datos_estado,
        usuario_responsable
      FROM historial_estados_transaccion
      WHERE transaccion_id = $1
      ORDER BY fecha_cambio DESC
    `, [transactionId])

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        historial: historialResult.rows
      }
    })

  } catch (error) {
    console.error('Error al obtener estado de transacción:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estado de transacción',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST: Avanzar al siguiente estado de una transacción
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { transactionId, newState, stateData, comments, currentUserUid } = data

    if (!transactionId || !newState || !currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Validar que la transacción existe
    const transactionResult = await query(`
      SELECT tipo_transaccion, estado_actual 
      FROM transacciones_departamentos 
      WHERE id = $1
    `, [transactionId])

    if (transactionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    const transaction = transactionResult.rows[0]

    // Validar estados válidos según el tipo de transacción
    const validStates = transaction.tipo_transaccion === 'venta' 
      ? ['reservado', 'promesa_compra_venta', 'firma_escrituras', 'desistimiento']
      : ['reservado', 'firma_y_pago', 'desistimiento']

    if (!validStates.includes(newState)) {
      return NextResponse.json(
        { success: false, error: `Estado inválido para transacción tipo ${transaction.tipo_transaccion}` },
        { status: 400 }
      )
    }

    // Usar la función de la base de datos para avanzar estado
    const result = await query(`
      SELECT avanzar_estado_transaccion($1, $2, $3, $4, $5)
    `, [transactionId, newState, JSON.stringify(stateData || {}), comments, currentUserUid])

    if (result.rows[0].avanzar_estado_transaccion) {
      // Obtener el estado actualizado
      const updatedResult = await query(`
        SELECT 
          estado_actual,
          datos_estado,
          fecha_ultimo_estado
        FROM transacciones_departamentos 
        WHERE id = $1
      `, [transactionId])

      return NextResponse.json({
        success: true,
        data: updatedResult.rows[0],
        message: `Estado actualizado a: ${newState}`
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'No se pudo avanzar al estado especificado' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error al avanzar estado de transacción:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al avanzar estado de transacción',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH: Finalizar una transacción
export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { transactionId, action, currentUserUid, ...actionData } = data

    if (!transactionId || !action || !currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    let result

    if (action === 'finalizar') {
      // Finalizar transacción
      result = await query(`
        SELECT finalizar_transaccion($1, $2)
      `, [transactionId, currentUserUid])
    } else if (action === 'cancelar') {
      // Cancelar transacción (desistimiento)
      const { razon_desistimiento, valor_amonestacion } = actionData
      
      if (!razon_desistimiento || valor_amonestacion === undefined) {
        return NextResponse.json(
          { success: false, error: 'Razón de desistimiento y valor de amonestación son requeridos' },
          { status: 400 }
        )
      }

      result = await query(`
        SELECT cancelar_transaccion($1, $2, $3, $4)
      `, [transactionId, razon_desistimiento, valor_amonestacion, currentUserUid])
    } else {
      return NextResponse.json(
        { success: false, error: 'Acción no válida' },
        { status: 400 }
      )
    }

    if (result.rows[0][action === 'finalizar' ? 'finalizar_transaccion' : 'cancelar_transaccion']) {
      return NextResponse.json({
        success: true,
        message: `Transacción ${action === 'finalizar' ? 'finalizada' : 'cancelada'} exitosamente`
      })
    } else {
      return NextResponse.json(
        { success: false, error: `No se pudo ${action} la transacción` },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error al procesar acción de transacción:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al procesar acción de transacción',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 