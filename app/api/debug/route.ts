import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET() {
  try {
    // Verificar edificios
    const buildingsQuery = `
      SELECT id, nombre, permalink, fecha_creacion 
      FROM edificios 
      ORDER BY fecha_creacion DESC
    `
    const buildingsResult = await executeQuery(buildingsQuery)
    
    // Verificar tabla de actividades
    let activitiesResult = null
    let activitiesError = null
    
    try {
      const activitiesQuery = `
        SELECT COUNT(*) as total, 
               MAX(fecha) as ultima_actividad
        FROM admin_acciones
      `
      activitiesResult = await executeQuery(activitiesQuery)
    } catch (error: any) {
      activitiesError = error.message
    }

    // Verificar administradores
    const adminsQuery = `
      SELECT COUNT(*) as total_admins,
             COUNT(CASE WHEN activo = true THEN 1 END) as admins_activos
      FROM administradores
    `
    const adminsResult = await executeQuery(adminsQuery)

    return NextResponse.json({
      success: true,
      debug: {
        buildings: {
          total: buildingsResult.rows.length,
          data: buildingsResult.rows
        },
        activities: {
          error: activitiesError,
          data: activitiesResult ? activitiesResult.rows[0] : null
        },
        admins: {
          data: adminsResult.rows[0]
        },
        microsites: {
          example_urls: buildingsResult.rows.map(b => `/edificio/${b.permalink}`)
        }
      }
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: 'Error general en debug endpoint'
    }, { status: 500 })
  }
}
