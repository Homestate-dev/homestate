import { NextRequest, NextResponse } from 'next/server'
import { updateAdmin, deleteAdmin, logAdminAction } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const body = await request.json()
    const { nombre, email, activo, currentUserEmail, currentUserUid } = body
    const targetUid = params.uid

    // No permitir que el administrador se modifique a sí mismo
    if (currentUserUid === targetUid) {
      return NextResponse.json(
        { success: false, error: 'No puedes modificar tu propio estado' },
        { status: 403 }
      )
    }

    // Solo homestate.dev@gmail.com puede activar/desactivar administradores
    if (activo !== undefined && currentUserEmail !== 'homestate.dev@gmail.com') {
      return NextResponse.json(
        { success: false, error: 'Solo el administrador principal puede activar/desactivar usuarios' },
        { status: 403 }
      )
    }

    const updates: any = {}
    if (nombre !== undefined) updates.nombre = nombre
    if (email !== undefined) updates.email = email
    if (activo !== undefined) updates.activo = activo

    const updatedAdmin = await updateAdmin(targetUid, updates)

    // Registrar acción
    if (currentUserUid) {
      let accionDescripcion = `Editó administrador: ${updatedAdmin.nombre}`
      if (activo !== undefined) {
        accionDescripcion += ` - ${activo ? 'Activado' : 'Desactivado'}`
      }
      
      await logAdminAction(
        currentUserUid,
        accionDescripcion,
        'edición',
        { admin_updated: targetUid, changes: updates }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedAdmin,
      message: 'Administrador actualizado exitosamente' 
    })

  } catch (error) {
    console.error('Error al actualizar administrador:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar administrador' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const url = new URL(request.url)
    const currentUserEmail = url.searchParams.get('currentUserEmail')
    const currentUserUid = url.searchParams.get('currentUserUid')
    const targetUid = params.uid

    // Solo homestate.dev@gmail.com puede eliminar administradores
    if (currentUserEmail !== 'homestate.dev@gmail.com') {
      return NextResponse.json(
        { success: false, error: 'Solo el administrador principal puede eliminar usuarios' },
        { status: 403 }
      )
    }

    // No puede eliminarse a sí mismo
    if (targetUid === currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    const deletedAdmin = await deleteAdmin(targetUid)

    // Registrar acción
    if (currentUserUid) {
      await logAdminAction(
        currentUserUid,
        `Eliminó administrador: ${deletedAdmin.nombre} (${deletedAdmin.email})`,
        'eliminación',
        { admin_deleted: targetUid }
      )
    }

    // TODO: También eliminar de Firebase Auth si es necesario
    // Esto requiere privilegios de administrador en Firebase

    return NextResponse.json({ 
      success: true, 
      message: 'Administrador eliminado exitosamente' 
    })

  } catch (error) {
    console.error('Error al eliminar administrador:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar administrador' },
      { status: 500 }
    )
  }
} 