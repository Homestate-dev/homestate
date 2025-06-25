import { NextRequest, NextResponse } from 'next/server'
import { getAdmins, createAdmin, logAdminAction } from '@/lib/database'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function GET() {
  try {
    const admins = await getAdmins()
    return NextResponse.json({ success: true, data: admins })
  } catch (error) {
    console.error('Error al obtener administradores:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener administradores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, password, currentUserUid } = body

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    try {
      // Guardar en la base de datos
      const adminData = {
        firebase_uid: firebaseUser.uid,
        nombre,
        email,
        creado_por: currentUserUid
      }

      const newAdmin = await createAdmin(adminData)

      // Registrar acción
      if (currentUserUid) {
        await logAdminAction(
          currentUserUid,
          `Creó nuevo administrador: ${nombre} (${email})`,
          'creación',
          { admin_created: firebaseUser.uid }
        )
      }

      return NextResponse.json({ 
        success: true, 
        data: newAdmin,
        message: 'Administrador creado exitosamente' 
      })

    } catch (dbError) {
      // Si falla la BD, eliminar el usuario de Firebase
      await firebaseUser.delete()
      throw dbError
    }

  } catch (error: any) {
    console.error('Error al crear administrador:', error)
    
    let errorMessage = 'Error al crear administrador'
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'El email ya está en uso'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña debe tener al menos 6 caracteres'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'El formato del email no es válido'
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 