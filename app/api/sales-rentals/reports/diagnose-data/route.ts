import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API diagnose-data called')

    // 1. Verificar qué edificios existen
    console.log('🏢 Checking buildings...')
    const buildingsQuery = `SELECT id, nombre, direccion FROM edificios ORDER BY id`
    const buildingsResult = await query(buildingsQuery, [])
    console.log('🏢 Buildings found:', buildingsResult.rows.length)
    console.log('🏢 Buildings:', buildingsResult.rows)

    // 2. Verificar qué departamentos existen para edificios específicos
    console.log('🏠 Checking departments for buildings 67, 100, 167...')
    const deptsQuery = `
      SELECT d.edificio_id, d.id, d.nombre, d.numero, d.piso, e.nombre as edificio_nombre
      FROM departamentos d 
      INNER JOIN edificios e ON e.id = d.edificio_id
      WHERE d.edificio_id IN (67, 100, 167)
      ORDER BY d.edificio_id, d.numero
    `
    const deptsResult = await query(deptsQuery, [])
    console.log('🏠 Departments found:', deptsResult.rows.length)
    console.log('🏠 Departments:', deptsResult.rows)

    // 3. Verificar total de transacciones en el sistema
    console.log('💼 Checking total transactions...')
    const totalTransQuery = `SELECT COUNT(*) as total FROM transacciones_departamentos`
    const totalTransResult = await query(totalTransQuery, [])
    console.log('💼 Total transactions in system:', totalTransResult.rows[0]?.total)

    // 4. Verificar estructura de la tabla de transacciones
    console.log('📋 Checking transaction table structure...')
    const structureQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' 
      ORDER BY ordinal_position
    `
    const structureResult = await query(structureQuery, [])
    console.log('📋 Transaction table columns:', structureResult.rows)

    // 5. Verificar algunas transacciones de muestra (cualquier edificio)
    console.log('📊 Checking sample transactions...')
    const sampleTransQuery = `
      SELECT 
        t.id, 
        t.departamento_id, 
        t.tipo_transaccion, 
        t.fecha_transaccion,
        t.valor_transaccion,
        d.numero as dept_numero,
        d.edificio_id,
        e.nombre as edificio_nombre
      FROM transacciones_departamentos t
      LEFT JOIN departamentos d ON d.id = t.departamento_id
      LEFT JOIN edificios e ON e.id = d.edificio_id
      ORDER BY t.fecha_transaccion DESC
      LIMIT 10
    `
    const sampleTransResult = await query(sampleTransQuery, [])
    console.log('📊 Sample transactions:', sampleTransResult.rows.length)
    console.log('📊 Sample transactions data:', sampleTransResult.rows)

    // 6. Verificar si hay transacciones con departamento_id nulo o inválido
    console.log('⚠️ Checking transactions with invalid departamento_id...')
    const invalidDeptQuery = `
      SELECT COUNT(*) as invalid_dept_count
      FROM transacciones_departamentos t
      WHERE t.departamento_id IS NULL 
         OR t.departamento_id NOT IN (SELECT id FROM departamentos)
    `
    const invalidDeptResult = await query(invalidDeptQuery, [])
    console.log('⚠️ Transactions with invalid departamento_id:', invalidDeptResult.rows[0]?.invalid_dept_count)

    // 7. Verificar transacciones por edificio específico
    const buildingIds = [67, 100, 167]
    for (const buildingId of buildingIds) {
      console.log(`🔍 Checking transactions for building ${buildingId}...`)
      const buildingTransQuery = `
        SELECT COUNT(*) as count
        FROM transacciones_departamentos t
        INNER JOIN departamentos d ON d.id = t.departamento_id
        WHERE d.edificio_id = $1
      `
      const buildingTransResult = await query(buildingTransQuery, [buildingId.toString()])
      console.log(`🔍 Building ${buildingId} transactions:`, buildingTransResult.rows[0]?.count)
    }

    // Compilar respuesta
    const diagnosticData = {
      buildings: buildingsResult.rows,
      departments: deptsResult.rows,
      totalTransactions: totalTransResult.rows[0]?.total,
      tableStructure: structureResult.rows,
      sampleTransactions: sampleTransResult.rows,
      invalidDepartmentTransactions: invalidDeptResult.rows[0]?.invalid_dept_count,
      buildingTransactionCounts: {
        building_67: 0,
        building_100: 0,
        building_167: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: diagnosticData,
      message: 'Diagnóstico completo de datos'
    })

  } catch (error) {
    console.error('❌ Error in diagnose-data:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al realizar diagnóstico de datos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
