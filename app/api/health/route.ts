import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    checks: {
      database: 'unknown',
      tables: 'unknown',
      endpoints: 'unknown'
    },
    details: {
      database: null,
      tables: null,
      errors: []
    }
  }

  try {
    // Verificar conexión a la base de datos
    const dbResult = await query('SELECT NOW() as current_time, version() as db_version')
    healthCheck.checks.database = 'healthy'
    healthCheck.details.database = {
      currentTime: dbResult.rows[0].current_time,
      version: dbResult.rows[0].db_version
    }
  } catch (error) {
    healthCheck.checks.database = 'unhealthy'
    healthCheck.details.errors.push(`Database connection failed: ${error}`)
    healthCheck.status = 'unhealthy'
  }

  try {
    // Verificar tablas principales
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'departamentos', 'edificios', 'administradores', 
        'transacciones_departamentos'
      )
    `)
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    const requiredTables = ['departamentos', 'edificios', 'administradores']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))
    
    if (missingTables.length === 0) {
      healthCheck.checks.tables = 'healthy'
      healthCheck.details.tables = {
        existing: existingTables,
        missing: [],
        total: existingTables.length
      }
    } else {
      healthCheck.checks.tables = 'unhealthy'
      healthCheck.details.tables = {
        existing: existingTables,
        missing: missingTables,
        total: existingTables.length
      }
      healthCheck.details.errors.push(`Missing tables: ${missingTables.join(', ')}`)
      healthCheck.status = 'unhealthy'
    }
  } catch (error) {
    healthCheck.checks.tables = 'unhealthy'
    healthCheck.details.errors.push(`Table check failed: ${error}`)
    healthCheck.status = 'unhealthy'
  }

  // Verificar estructura de departamentos
  try {
    const deptColumnsResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'departamentos'
      AND column_name IN ('area_total', 'area')
    `)
    
    const hasAreaTotal = deptColumnsResult.rows.some(col => col.column_name === 'area_total')
    const hasArea = deptColumnsResult.rows.some(col => col.column_name === 'area')
    
    if (!hasAreaTotal && !hasArea) {
      healthCheck.details.errors.push('Missing area column in departamentos table')
      healthCheck.status = 'unhealthy'
    }
  } catch (error) {
    healthCheck.details.errors.push(`Department structure check failed: ${error}`)
    healthCheck.status = 'unhealthy'
  }

  // Verificar endpoints básicos
  try {
    // Probar query de departamentos
    const deptTestResult = await query(`
      SELECT COUNT(*) as count 
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      WHERE d.disponible = true
      LIMIT 1
    `)
    
    healthCheck.checks.endpoints = 'healthy'
  } catch (error) {
    healthCheck.checks.endpoints = 'unhealthy'
    healthCheck.details.errors.push(`Endpoint test failed: ${error}`)
    healthCheck.status = 'unhealthy'
  }

  // Determinar status final
  const allChecksHealthy = Object.values(healthCheck.checks).every(check => check === 'healthy')
  if (!allChecksHealthy) {
    healthCheck.status = 'unhealthy'
  }

  // Retornar respuesta con status code apropiado
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503

  return NextResponse.json(healthCheck, { status: statusCode })
} 