import { NextRequest, NextResponse } from 'next/server'
import { getDepartmentById, updateDepartment, deleteDepartment, toggleDepartmentAvailability, logAdminAction } from '@/lib/database'
import { deleteDepartmentImages } from '@/lib/firebase-admin'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const departmentId = parseInt(params.id)

    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: 'ID de departamento inválido' },
        { status: 400 }
      )
    }

    const department = await getDepartmentById(departmentId)

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      )
    }

    // Asegurar que los datos estén completos antes de enviarlos
    const safeDepartment = {
      ...department,
      nombre: department.nombre || '',
      numero: department.numero || '',
      piso: department.piso || 0,
      area: department.area || 0,
      cantidad_habitaciones: department.cantidad_habitaciones || 'No especificado',
      tipo: department.tipo || '',
      estado: department.estado || '',
      ideal_para: department.ideal_para || '',
      imagenes: Array.isArray(department.imagenes) ? department.imagenes : []
    }

    return NextResponse.json(safeDepartment)
  } catch (error) {
    console.error('Error al obtener departamento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
    const { action, currentUserUid, imageUrls } = body

    if (!currentUserUid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      }, { status: 401 })
    }

    // Manejar eliminación de imágenes específicas
    if (action === 'delete_images') {
      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'URLs de imágenes requeridas' 
        }, { status: 400 })
      }

      // Obtener departamento actual para obtener las imágenes actuales
      const currentDepartment = await getDepartmentById(departmentId)
      if (!currentDepartment) {
        return NextResponse.json({ 
          success: false, 
          error: 'Departamento no encontrado' 
        }, { status: 404 })
      }

      // Eliminar imágenes de Firebase
      try {
        await deleteDepartmentImages(imageUrls, currentDepartment.edificio_permalink, currentDepartment.numero)
      } catch (firebaseError) {
        console.error('Error eliminando imágenes de Firebase:', firebaseError)
        // Continuar aunque falle Firebase, para mantener consistencia con BD
      }

      // Actualizar base de datos removiendo las imágenes eliminadas
      const remainingImages = currentDepartment.imagenes.filter((img: string) => !imageUrls.includes(img))
      
      const updatedDepartment = await updateDepartment(departmentId, {
        imagenes: remainingImages
      })

      // Registrar la acción del administrador
      await logAdminAction(
        currentUserUid,
        `Eliminó ${imageUrls.length} imagen(es) del departamento ID ${departmentId}`,
        'eliminación',
        {
          departamento_id: departmentId,
          imagenes_eliminadas: imageUrls,
          imagenes_restantes: remainingImages.length
        }
      )

      return NextResponse.json({ 
        success: true, 
        data: updatedDepartment,
        message: `${imageUrls.length} imagen(es) eliminada(s) exitosamente`
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Acción no válida' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('Error en operación PATCH:', error)
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