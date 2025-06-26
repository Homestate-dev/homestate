import { NextRequest, NextResponse } from 'next/server'
import { getDepartmentById, updateDepartment, deleteDepartment, toggleDepartmentAvailability, logAdminAction } from '@/lib/database'

export async function GET(
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

    const department = await getDepartmentById(departmentId)

    if (!department) {
      return NextResponse.json({ 
        success: false, 
        error: 'Departamento no encontrado' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: department 
    })

  } catch (error) {
    console.error('Error al obtener departamento:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { currentUserUid, ...updates } = body

    if (!currentUserUid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 })
    }

    // Actualizar departamento
    const updatedDepartment = await updateDepartment(departmentId, updates)

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Actualizó el departamento ID ${departmentId}`,
      'edición',
      {
        departamento_id: departmentId,
        campos_actualizados: Object.keys(updates)
      }
    )

    return NextResponse.json({ 
      success: true, 
      data: updatedDepartment,
      message: 'Departamento actualizado exitosamente'
    })

  } catch (error: any) {
    console.error('Error al actualizar departamento:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Obtener datos del departamento antes de eliminarlo
    const department = await getDepartmentById(departmentId)

    if (!department) {
      return NextResponse.json({ 
        success: false, 
        error: 'Departamento no encontrado' 
      }, { status: 404 })
    }

    // Eliminar departamento
    await deleteDepartment(departmentId)

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Eliminó el departamento ${department.numero} (ID: ${departmentId})`,
      'eliminación',
      {
        departamento_id: departmentId,
        numero: department.numero,
        nombre: department.nombre,
        edificio_id: department.edificio_id
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Departamento eliminado exitosamente'
    })

  } catch (error: any) {
    console.error('Error al eliminar departamento:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 