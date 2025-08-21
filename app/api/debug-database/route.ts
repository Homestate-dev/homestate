import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting database debug...')

    const results: any = {}

    // 1. Count total buildings
    const buildingsCount = await query('SELECT COUNT(*) as count FROM edificios', [])
    results.totalBuildings = buildingsCount.rows[0]?.count
    console.log('🏢 Total buildings:', results.totalBuildings)

    // 2. Count total departments
    const deptsCount = await query('SELECT COUNT(*) as count FROM departamentos', [])
    results.totalDepartments = deptsCount.rows[0]?.count
    console.log('🏠 Total departments:', results.totalDepartments)

    // 3. Count total transactions
    const transCount = await query('SELECT COUNT(*) as count FROM transacciones_ventas_arriendos', [])
    results.totalTransactions = transCount.rows[0]?.count
    console.log('💼 Total transactions:', results.totalTransactions)

    // 4. Check specific buildings
    const buildingCheck = await query(`
      SELECT id, nombre 
      FROM edificios 
      WHERE id IN (67, 100, 167) 
      ORDER BY id
    `, [])
    results.specificBuildings = buildingCheck.rows
    console.log('🏢 Specific buildings:', results.specificBuildings)

    // 5. Check departments for these buildings
    const deptCheck = await query(`
      SELECT d.edificio_id, COUNT(*) as dept_count
      FROM departamentos d
      WHERE d.edificio_id IN (67, 100, 167)
      GROUP BY d.edificio_id
      ORDER BY d.edificio_id
    `, [])
    results.departmentsByBuilding = deptCheck.rows
    console.log('🏠 Departments by building:', results.departmentsByBuilding)

    // 6. Check transactions for these buildings
    const transCheck = await query(`
      SELECT d.edificio_id, COUNT(*) as trans_count
      FROM transacciones_ventas_arriendos t
      INNER JOIN departamentos d ON d.id = t.departamento_id
      WHERE d.edificio_id IN (67, 100, 167)
      GROUP BY d.edificio_id
      ORDER BY d.edificio_id
    `, [])
    results.transactionsByBuilding = transCheck.rows
    console.log('💼 Transactions by building:', results.transactionsByBuilding)

    // 7. Show sample transaction data
    const sampleTrans = await query(`
      SELECT 
        t.id,
        t.departamento_id,
        t.tipo_transaccion,
        t.fecha_transaccion,
        d.numero as dept_numero,
        d.edificio_id,
        e.nombre as edificio_nombre
      FROM transacciones_ventas_arriendos t
      INNER JOIN departamentos d ON d.id = t.departamento_id
      INNER JOIN edificios e ON e.id = d.edificio_id
      LIMIT 5
    `, [])
    results.sampleTransactions = sampleTrans.rows
    console.log('📊 Sample transactions:', results.sampleTransactions)

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Database debug complete'
    })

  } catch (error) {
    console.error('❌ Database debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
