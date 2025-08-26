import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // Verificar estructura de tabla
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_ventas_arriendos'
      AND column_name IN ('referido_por', 'canal_captacion', 'fecha_primer_contacto', 'notas', 'observaciones')
      ORDER BY column_name;
    `
    
    const structureResult = await query(structureQuery)
    
    // Verificar datos reales
    const dataQuery = `
      SELECT 
        id,
        cliente_nombre,
        referido_por,
        canal_captacion,
        fecha_primer_contacto,
        notas,
        observaciones,
        fecha_registro
      FROM transacciones_ventas_arriendos 
      ORDER BY fecha_registro DESC 
      LIMIT 3;
    `
    
    const dataResult = await query(dataQuery)
    
    // Estadísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transacciones,
        COUNT(referido_por) as con_referido,
        COUNT(canal_captacion) as con_canal,
        COUNT(fecha_primer_contacto) as con_fecha_contacto,
        COUNT(notas) as con_notas,
        COUNT(observaciones) as con_observaciones
      FROM transacciones_ventas_arriendos;
    `
    
    const statsResult = await query(statsQuery)

    return NextResponse.json({
      success: true,
      data: {
        tableStructure: structureResult.rows,
        recentTransactions: dataResult.rows,
        statistics: statsResult.rows[0]
      }
    })

  } catch (error) {
    console.error('Error en debug:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
