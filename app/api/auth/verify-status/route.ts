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

    // EXCEPCIÓN: homestate.dev@gmail.com siempre puede ingresar
    if (email === 'homestate.dev@gmail.com') {
      // Buscar o crear el administrador principal
      let query = `
        SELECT firebase_uid, nombre, email, activo, fecha_creacion, fecha_actualizacion
        FROM administradores 
        WHERE email = $1
      `
      let result = await executeQuery(query, [email])

      if (result.rows.length === 0) {
        // Crear el administrador principal si no existe
        const insertQuery = `
          INSERT INTO administradores (firebase_uid, nombre, email, activo, creado_por)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING firebase_uid, nombre, email, activo, fecha_creacion
        `
        result = await executeQuery(insertQuery, [
          firebase_uid,
          'Administrador Principal',
          email,
          true,
          firebase_uid
        ])
      } else if (result.rows[0].firebase_uid !== firebase_uid) {
        // Actualizar el firebase_uid si cambió
        const updateQuery = `
          UPDATE administradores 
          SET firebase_uid = $1, activo = true
          WHERE email = $2
          RETURNING firebase_uid, nombre, email, activo, fecha_creacion
        `
        result = await executeQuery(updateQuery, [firebase_uid, email])
      } else if (!result.rows[0].activo) {
        // Reactivar si estaba inactivo
        const updateQuery = `
          UPDATE administradores 
          SET activo = true
          WHERE email = $1
          RETURNING firebase_uid, nombre, email, activo, fecha_creacion
        `
        result = await executeQuery(updateQuery, [email])
      }

      const admin = result.rows[0]
      return NextResponse.json({
        success: true,
        adminData: {
          firebase_uid: admin.firebase_uid,
          nombre: admin.nombre,
          email: admin.email,
          activo: true, // Siempre activo para el admin principal
          fecha_creacion: admin.fecha_creacion
        }
      })
    }

    // Buscar el administrador en la base de datos (para otros usuarios)
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