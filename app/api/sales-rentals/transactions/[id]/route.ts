import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const transactionId = parseInt(params.id)

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID de transacción inválido' },
        { status: 400 }
      )
    }

    // Obtener la transacción actual
    const currentTransaction = await query(
      'SELECT * FROM transacciones_ventas_arriendos WHERE id = $1',
      [transactionId]
    )

    if (currentTransaction.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    const transaction = currentTransaction.rows[0]

    // Actualizar la transacción
    const updateFields = []
    const updateValues = []
    let paramCount = 0

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id') {
        paramCount++
        updateFields.push(`${key} = $${paramCount}`)
        updateValues.push(value)
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    paramCount++
    updateValues.push(transactionId)

    const sql = `
      UPDATE transacciones_ventas_arriendos 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await query(sql, updateValues)

    // Si se cambia el estado a completada, actualizar el departamento
    if (data.estado === 'completada' && transaction.estado !== 'completada') {
      const newStatus = transaction.tipo_transaccion === 'venta' ? 'vendido' : 'arrendado'
      await query(
        'UPDATE departamentos SET estado = $1 WHERE id = $2',
        [newStatus, transaction.departamento_id]
      )
    }

    // Si se cambia de completada a otro estado, revertir el departamento a disponible
    if (transaction.estado === 'completada' && data.estado !== 'completada') {
      await query(
        'UPDATE departamentos SET estado = $1 WHERE id = $2',
        ['disponible', transaction.departamento_id]
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error al actualizar transacción:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la transacción' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id)

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID de transacción inválido' },
        { status: 400 }
      )
    }

    // Obtener información de la transacción antes de eliminarla
    const transactionResult = await query(
      'SELECT departamento_id, estado, tipo_transaccion FROM transacciones_ventas_arriendos WHERE id = $1',
      [transactionId]
    )

    if (transactionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    const transaction = transactionResult.rows[0]

    // Eliminar la transacción
    await query('DELETE FROM transacciones_ventas_arriendos WHERE id = $1', [transactionId])

    // Si la transacción estaba completada, revertir el estado del departamento
    if (transaction.estado === 'completada') {
      await query(
        'UPDATE departamentos SET estado = $1 WHERE id = $2',
        ['disponible', transaction.departamento_id]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar transacción:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la transacción' },
      { status: 500 }
    )
  }
} 