import { NextRequest, NextResponse } from 'next/server'
import { toggleDepartmentAvailability, logAdminAction } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const departmentId = parseInt(id)

    if (isNaN(departmentId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de departamento inválido' 
      }, { status: 400 })
    }

    const body = await request.json()
    const { currentUserUid } = body

    if (!currentUserUid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 })
    }

    // Cambiar disponibilidad
    const updatedDepartment = await toggleDepartmentAvailability(departmentId)

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Cambió disponibilidad del departamento ID ${departmentId} a ${updatedDepartment.disponible ? 'disponible' : 'no disponible'}`,
      'edición',
      {
        departamento_id: departmentId,
        nueva_disponibilidad: updatedDepartment.disponible
      }
    )

    return NextResponse.json({ 
      success: true, 
      data: updatedDepartment,
      message: `Departamento marcado como ${updatedDepartment.disponible ? 'disponible' : 'no disponible'}`
    })

  } catch (error: any) {
    console.error('Error al cambiar disponibilidad:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 