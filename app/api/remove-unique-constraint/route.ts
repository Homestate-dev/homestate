import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST() {
  try {
    // Verificar restricciones UNIQUE existentes
    const checkConstraintsQuery = `
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'transacciones_departamentos' 
      AND constraint_type = 'UNIQUE';
    `
    
    const constraintsResult = await query(checkConstraintsQuery)
    
    if (constraintsResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No se encontraron restricciones UNIQUE para eliminar',
        constraints: []
      })
    }
    
    // Eliminar cada restricción UNIQUE
    const results = []
    for (const constraint of constraintsResult.rows) {
      try {
        const dropQuery = `ALTER TABLE transacciones_departamentos DROP CONSTRAINT ${constraint.constraint_name};`
        await query(dropQuery)
        results.push({
          constraint: constraint.constraint_name,
          status: 'eliminated',
          message: `Restricción ${constraint.constraint_name} eliminada exitosamente`
        })
      } catch (error) {
        results.push({
          constraint: constraint.constraint_name,
          status: 'error',
          message: `Error al eliminar: ${error.message}`
        })
      }
    }

    // Verificar eliminación
    const finalCheckResult = await query(checkConstraintsQuery)
    
    return NextResponse.json({
      success: true,
      message: finalCheckResult.rows.length === 0 
        ? 'Todas las restricciones UNIQUE fueron eliminadas exitosamente' 
        : 'Algunas restricciones no pudieron ser eliminadas',
      results,
      remainingConstraints: finalCheckResult.rows
    })

  } catch (error) {
    console.error('Error al eliminar restricciones:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
