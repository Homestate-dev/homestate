import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transacciones,
        COUNT(CASE WHEN tipo_transaccion = 'venta' AND estado = 'completada' THEN 1 END) as ventas_completadas,
        COUNT(CASE WHEN tipo_transaccion = 'arriendo' AND estado = 'completada' THEN 1 END) as arriendos_completados,
        COALESCE(SUM(CASE WHEN tipo_transaccion = 'venta' AND estado = 'completada' THEN valor_transaccion ELSE 0 END), 0) as valor_total_ventas,
        COALESCE(SUM(CASE WHEN tipo_transaccion = 'arriendo' AND estado = 'completada' THEN valor_transaccion ELSE 0 END), 0) as valor_total_arriendos,
        COALESCE(SUM(CASE WHEN estado = 'completada' THEN comision_valor ELSE 0 END), 0) as comisiones_generadas,
        COUNT(CASE WHEN DATE_TRUNC('month', fecha_transaccion) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as transacciones_mes_actual
      FROM transacciones_ventas_arriendos
    `

    const statsResult = await query(statsQuery)
    const stats = statsResult.rows[0]

    // Convertir strings a números
    const processedStats = {
      total_transacciones: parseInt(stats.total_transacciones) || 0,
      ventas_completadas: parseInt(stats.ventas_completadas) || 0,
      arriendos_completados: parseInt(stats.arriendos_completados) || 0,
      valor_total_ventas: parseFloat(stats.valor_total_ventas) || 0,
      valor_total_arriendos: parseFloat(stats.valor_total_arriendos) || 0,
      comisiones_generadas: parseFloat(stats.comisiones_generadas) || 0,
      transacciones_mes_actual: parseInt(stats.transacciones_mes_actual) || 0
    }

    return NextResponse.json({
      success: true,
      data: processedStats
    })

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
} 