import { NextRequest, NextResponse } from 'next/server'
import { createTransaction, getSalesReport, logAdminAction } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const agentId = searchParams.get('agentId')

    // Valores por defecto: último mes
    const defaultEndDate = new Date().toISOString().split('T')[0]
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const start = startDate || defaultStartDate
    const end = endDate || defaultEndDate
    const agent = agentId ? parseInt(agentId) : undefined

    const transactions = await getSalesReport(start, end, agent)
    
    return NextResponse.json({ 
      success: true, 
      data: transactions,
      params: { startDate: start, endDate: end, agentId: agent }
    })
  } catch (error) {
    console.error('Error al obtener reporte de transacciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener reporte de transacciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      departamento_id,
      agente_id,
      tipo_transaccion,
      precio_final,
      precio_original,
      cliente_nombre,
      cliente_email,
      cliente_telefono,
      notas,
      currentUserUid 
    } = body

    if (!departamento_id || !agente_id || !tipo_transaccion || !precio_final) {
      return NextResponse.json(
        { success: false, error: 'Departamento, agente, tipo de transacción y precio final son requeridos' },
        { status: 400 }
      )
    }

    if (!['venta', 'arriendo'].includes(tipo_transaccion)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de transacción debe ser "venta" o "arriendo"' },
        { status: 400 }
      )
    }

    if (!currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const transactionData = {
      departamento_id: parseInt(departamento_id),
      agente_id: parseInt(agente_id),
      tipo_transaccion,
      precio_final: parseFloat(precio_final),
      precio_original: precio_original ? parseFloat(precio_original) : undefined,
      cliente_nombre,
      cliente_email,
      cliente_telefono,
      notas,
      creado_por: currentUserUid
    }

    const newTransaction = await createTransaction(transactionData)

    // Registrar acción del administrador
    await logAdminAction(
      currentUserUid,
      `Registró ${tipo_transaccion} de departamento por $${precio_final}`,
      'transacción',
      { 
        transaction_id: newTransaction.id,
        departamento_id,
        agente_id,
        tipo_transaccion,
        precio_final,
        cliente_nombre
      }
    )

    return NextResponse.json({ 
      success: true, 
      data: newTransaction,
      message: `${tipo_transaccion === 'venta' ? 'Venta' : 'Arriendo'} registrada exitosamente` 
    })

  } catch (error: any) {
    console.error('Error al crear transacción:', error)
    
    let errorMessage = 'Error al registrar transacción'
    
    if (error.message === 'Agente no encontrado') {
      errorMessage = 'El agente seleccionado no existe'
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 