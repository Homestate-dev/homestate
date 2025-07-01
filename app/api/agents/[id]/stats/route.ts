import { NextRequest, NextResponse } from 'next/server'
import { getAgentStats, getTransactionsByAgent } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id)
    if (isNaN(agentId)) {
      return NextResponse.json(
        { success: false, error: 'ID de agente inválido' },
        { status: 400 }
      )
    }

    // Obtener estadísticas del agente
    const statsResult = await getAgentStats(agentId)
    const stats = statsResult.length > 0 ? statsResult[0] : null

    if (!stats) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    // Obtener transacciones recientes del agente
    const transactions = await getTransactionsByAgent(agentId)

    return NextResponse.json({ 
      success: true, 
      data: {
        ...stats,
        recent_transactions: transactions.slice(0, 10) // Últimas 10 transacciones
      }
    })
  } catch (error) {
    console.error('Error al obtener estadísticas del agente:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 