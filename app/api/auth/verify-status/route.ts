import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firebase_uid, email } = body

    if (!firebase_uid || !email) {
      return NextResponse.json(
        { success: false, error: 'UID y email son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el administrador en la base de datos
    const query = `
      SELECT firebase_uid, nombre, email, activo, fecha_creacion, fecha_actualizacion
      FROM administradores 
      WHERE firebase_uid = $1 OR email = $2
    `
    const result = await executeQuery(query, [firebase_uid, email])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado en el sistema' },
        { status: 404 }
      )
    }

    const admin = result.rows[0]

    // Verificar si el usuario está activo
    if (!admin.activo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'inactive_user',
          message: 'Tu cuenta está inactiva. Por favor comunícate con el administrador superior para recuperar la actividad en HomEstate.',
          adminData: {
            nombre: admin.nombre,
            email: admin.email,
            fecha_desactivacion: admin.fecha_actualizacion
          }
        },
        { status: 403 }
      )
    }

    // Usuario activo, devolver datos
    return NextResponse.json({
      success: true,
      adminData: {
        firebase_uid: admin.firebase_uid,
        nombre: admin.nombre,
        email: admin.email,
        activo: admin.activo,
        fecha_creacion: admin.fecha_creacion
      }
    })

  } catch (error: any) {
    console.error('Error al verificar estado del usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 