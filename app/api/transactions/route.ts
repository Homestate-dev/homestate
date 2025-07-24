import { NextRequest, NextResponse } from 'next/server'
import { createTransaction } from '@/lib/database'

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
      currentUserUid,
      // Nuevos campos para comisiones
      comision_porcentaje,
      comision_valor,
      porcentaje_homestate,
      porcentaje_bienes_raices,
      porcentaje_admin_edificio,
      valor_homestate,
      valor_bienes_raices,
      valor_admin_edificio
    } = body

    // Validaciones básicas
    if (!departamento_id || !agente_id || !tipo_transaccion || !precio_final || !cliente_nombre) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    // Validar porcentajes
    const totalPorcentajes = (parseFloat(porcentaje_homestate) || 0) + 
                            (parseFloat(porcentaje_bienes_raices) || 0) + 
                            (parseFloat(porcentaje_admin_edificio) || 0)
    
    if (totalPorcentajes > 100) {
      return NextResponse.json({
        success: false,
        error: 'La suma de los porcentajes no puede exceder el 100%'
      }, { status: 400 })
    }

    const transactionData = {
      departamento_id: parseInt(departamento_id),
      agente_id: parseInt(agente_id),
      tipo_transaccion,
      precio_final: parseFloat(precio_final),
      precio_original: precio_original ? parseFloat(precio_original) : undefined,
      cliente_nombre,
      cliente_email: cliente_email || undefined,
      cliente_telefono: cliente_telefono || undefined,
      notas: notas || undefined,
      creado_por: currentUserUid,
      // Nuevos campos
      comision_porcentaje: comision_porcentaje ? parseFloat(comision_porcentaje) : undefined,
      comision_valor: comision_valor ? parseFloat(comision_valor) : undefined,
      porcentaje_homestate: porcentaje_homestate ? parseFloat(porcentaje_homestate) : undefined,
      porcentaje_bienes_raices: porcentaje_bienes_raices ? parseFloat(porcentaje_bienes_raices) : undefined,
      porcentaje_admin_edificio: porcentaje_admin_edificio ? parseFloat(porcentaje_admin_edificio) : undefined,
      valor_homestate: valor_homestate ? parseFloat(valor_homestate) : undefined,
      valor_bienes_raices: valor_bienes_raices ? parseFloat(valor_bienes_raices) : undefined,
      valor_admin_edificio: valor_admin_edificio ? parseFloat(valor_admin_edificio) : undefined
    }

    const transaction = await createTransaction(transactionData)

    return NextResponse.json({
      success: true,
      message: 'Transacción creada exitosamente',
      data: transaction
    })

  } catch (error: any) {
    console.error('Error al crear transacción:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 })
  }
} 