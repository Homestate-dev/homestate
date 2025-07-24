import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edificio_id = searchParams.get('edificio_id')

    const testResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      tests: {
        connection: 'unknown',
        tables: 'unknown',
        columns: 'unknown',
        data: 'unknown',
        query: 'unknown'
      },
      details: {
        tables: [],
        columns: [],
        data: [],
        errors: []
      }
    }

    // Test 1: Verificar conexión
    try {
      const connectionTest = await query('SELECT NOW() as current_time')
      testResults.tests.connection = 'success'
      testResults.details.data.push({ connection: connectionTest.rows[0] })
    } catch (error) {
      testResults.tests.connection = 'failed'
      testResults.details.errors.push(`Connection failed: ${error}`)
    }

    // Test 2: Verificar tablas
    try {
      const tablesTest = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('departamentos', 'edificios', 'administradores')
        ORDER BY table_name
      `)
      testResults.tests.tables = 'success'
      testResults.details.tables = tablesTest.rows.map(row => row.table_name)
    } catch (error) {
      testResults.tests.tables = 'failed'
      testResults.details.errors.push(`Tables check failed: ${error}`)
    }

    // Test 3: Verificar columnas de departamentos
    try {
      const columnsTest = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'departamentos'
        ORDER BY ordinal_position
      `)
      testResults.tests.columns = 'success'
      testResults.details.columns = columnsTest.rows
    } catch (error) {
      testResults.tests.columns = 'failed'
      testResults.details.errors.push(`Columns check failed: ${error}`)
    }

    // Test 4: Verificar datos
    try {
      const deptCount = await query('SELECT COUNT(*) as count FROM departamentos')
      const buildingCount = await query('SELECT COUNT(*) as count FROM edificios')
      const adminCount = await query('SELECT COUNT(*) as count FROM administradores')
      
      testResults.tests.data = 'success'
      testResults.details.data.push({
        departamentos: deptCount.rows[0].count,
        edificios: buildingCount.rows[0].count,
        administradores: adminCount.rows[0].count
      })
    } catch (error) {
      testResults.tests.data = 'failed'
      testResults.details.errors.push(`Data check failed: ${error}`)
    }

    // Test 5: Probar query específica
    try {
      let sql = `
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          COALESCE(d.area_total, d.area) as area,
          d.edificio_id,
          d.valor_venta,
          d.valor_arriendo,
          d.estado,
          d.disponible,
          d.tipo,
          d.cantidad_habitaciones,
          e.nombre as edificio_nombre,
          e.direccion as edificio_direccion
        FROM departamentos d
        JOIN edificios e ON d.edificio_id = e.id
      `

      const params: any[] = []

      if (edificio_id) {
        const edificioIdNum = parseInt(edificio_id)
        if (!isNaN(edificioIdNum)) {
          sql += ` WHERE d.edificio_id = $1`
          params.push(edificioIdNum)
        }
      } else {
        sql += ` WHERE d.disponible = true`
      }

      sql += ` ORDER BY e.nombre, d.piso, d.numero LIMIT 5`

      const queryTest = await query(sql, params)
      testResults.tests.query = 'success'
      testResults.details.data.push({
        query: 'success',
        results: queryTest.rows.length,
        sample: queryTest.rows[0] || null
      })
    } catch (error) {
      testResults.tests.query = 'failed'
      testResults.details.errors.push(`Query failed: ${error}`)
    }

    // Determinar status general
    const allTestsPassed = Object.values(testResults.tests).every(test => test === 'success')
    const statusCode = allTestsPassed ? 200 : 500

    return NextResponse.json(testResults, { status: statusCode })

  } catch (error) {
    console.error('Error en endpoint de prueba:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Error general en endpoint de prueba',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 