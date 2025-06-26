import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET() {
  try {
    // Obtener todas las actividades con información del administrador
    const query = `
      SELECT 
        aa.id,
        aa.admin_firebase_uid,
        aa.accion,
        aa.tipo,
        aa.metadata,
        aa.fecha,
        a.nombre as admin_nombre,
        a.email as admin_email
      FROM admin_acciones aa
      LEFT JOIN administradores a ON aa.admin_firebase_uid = a.firebase_uid
      ORDER BY aa.fecha DESC
      LIMIT 200
    `
    
    const result = await executeQuery(query)
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length
    })

  } catch (error: any) {
    console.error('Error al obtener actividades:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener actividades: ' + error.message },
      { status: 500 }
    )
  }
}
