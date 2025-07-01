import { NextRequest, NextResponse } from 'next/server'
import { getBuildingById, deleteBuilding, updateBuilding, logAdminAction, executeQuery } from '@/lib/database'
import { deleteBuildingImages } from '@/lib/firebase-admin'

function safeJsonParse(jsonString: string | any[] | null, defaultValue: any = null) {
  if (!jsonString) return defaultValue
  
  // Si ya es un array o objeto, devolverlo directamente
  if (Array.isArray(jsonString) || typeof jsonString === 'object') {
    return jsonString
  }
  
  // Solo intentar parsear si es un string
  if (typeof jsonString !== 'string') {
    return defaultValue
  }
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return defaultValue
  }
}

// Función auxiliar para obtener edificio por permalink
async function getBuildingByPermalink(permalink: string) {
  try {
    const query = `
      SELECT 
        id,
        nombre,
        direccion,
        permalink,
        costo_expensas,
        areas_comunales,
        seguridad,
        aparcamiento,
        url_imagen_principal,
        imagenes_secundarias,
        fecha_creacion
      FROM edificios 
      WHERE permalink = $1
    `
    
    const result = await executeQuery(query, [permalink])
    
    if (result.rows.length === 0) return null
    
    const building = result.rows[0]
    
    return {
      ...building,
      areas_comunales: safeJsonParse(building.areas_comunales, []),
      seguridad: safeJsonParse(building.seguridad, []),
      aparcamiento: safeJsonParse(building.aparcamiento, []),
      imagenes_secundarias: safeJsonParse(building.imagenes_secundarias, [])
    }
  } catch (error) {
    console.error('Error fetching building by permalink:', error)
    return null
  }
}

// GET method para obtener edificio por ID o permalink
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id

    // Verificar si es un ID numérico o un permalink
    const isNumericId = /^\d+$/.test(identifier)
    
    let building
    
    if (isNumericId) {
      // Es un ID numérico
      const buildingId = parseInt(identifier)
      building = await getBuildingById(buildingId)
    } else {
      // Es un permalink
      building = await getBuildingByPermalink(identifier)
    }
    
    if (!building) {
      return NextResponse.json(
        { success: false, error: 'Edificio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: building 
    })

  } catch (error) {
    console.error('Error al obtener edificio:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buildingId = parseInt(params.id)
    if (isNaN(buildingId)) {
      return NextResponse.json(
        { success: false, error: 'ID de edificio inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { currentUserUid, buildingName } = body

    if (!currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Obtener los datos del edificio antes de eliminarlo
    const building = await getBuildingById(buildingId)
    if (!building) {
      return NextResponse.json(
        { success: false, error: 'Edificio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el nombre coincida (seguridad adicional)
    if (buildingName && building.nombre !== buildingName) {
      return NextResponse.json(
        { success: false, error: 'El nombre del edificio no coincide' },
        { status: 400 }
      )
    }

    // Intentar eliminar las imágenes de Firebase primero
    let imagesDeletionResult = null
    try {
      imagesDeletionResult = await deleteBuildingImages({
        nombre: building.nombre,
        url_imagen_principal: building.url_imagen_principal,
        imagenes_secundarias: building.imagenes_secundarias
      })
      console.log('Images deletion result:', imagesDeletionResult)
    } catch (error) {
      console.error('Error deleting building images:', error)
      // Continuar con la eliminación del edificio aunque falle la eliminación de imágenes
    }

    // Eliminar el edificio de la base de datos
    const deletedBuilding = await deleteBuilding(buildingId)
    
    if (!deletedBuilding) {
      return NextResponse.json(
        { success: false, error: 'No se pudo eliminar el edificio' },
        { status: 500 }
      )
    }

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Eliminó edificio: ${building.nombre}`,
      'eliminación',
      { 
        building_deleted: buildingId, 
        building_name: building.nombre,
        images_deleted: imagesDeletionResult?.deletedFiles?.length || 0,
        images_failed: imagesDeletionResult?.failedFiles?.length || 0
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Edificio eliminado exitosamente',
      data: {
        building: deletedBuilding,
        imagesDeleted: imagesDeletionResult?.deletedFiles?.length || 0,
        imagesFailed: imagesDeletionResult?.failedFiles?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Error al eliminar edificio:', error)
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al eliminar edificio' },
      { status: 500 }
    )
  }
}

// PUT method para actualizar edificio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buildingId = parseInt(params.id)
    if (isNaN(buildingId)) {
      return NextResponse.json(
        { success: false, error: 'ID de edificio inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      nombre,
      direccion,
      costo_expensas,
      areas_comunales,
      seguridad,
      aparcamiento,
      url_imagen_principal,
      imagenes_secundarias,
      politica_mascotas,
      descripcion,
      currentUserUid 
    } = body

    if (!currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el edificio existe
    const existingBuilding = await getBuildingById(buildingId)
    if (!existingBuilding) {
      return NextResponse.json(
        { success: false, error: 'Edificio no encontrado' },
        { status: 404 }
      )
    }

    // Preparar los datos de actualización
    const updateData: any = {}
    
    if (nombre !== undefined) updateData.nombre = nombre
    if (direccion !== undefined) updateData.direccion = direccion
    if (costo_expensas !== undefined) updateData.costo_expensas = costo_expensas
    if (areas_comunales !== undefined) updateData.areas_comunales = areas_comunales
    if (seguridad !== undefined) updateData.seguridad = seguridad
    if (aparcamiento !== undefined) updateData.aparcamiento = aparcamiento
    if (url_imagen_principal !== undefined) updateData.url_imagen_principal = url_imagen_principal
    if (imagenes_secundarias !== undefined) updateData.imagenes_secundarias = imagenes_secundarias

    // Actualizar el edificio
    const updatedBuilding = await updateBuilding(buildingId, updateData)

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Actualizó edificio: ${updatedBuilding.nombre}`,
      'actualización',
      { 
        building_updated: buildingId, 
        building_name: updatedBuilding.nombre,
        fields_updated: Object.keys(updateData)
      }
    )

    return NextResponse.json({ 
      success: true, 
      data: {
        ...updatedBuilding,
        areas_comunales: safeJsonParse(updatedBuilding.areas_comunales, []),
        seguridad: safeJsonParse(updatedBuilding.seguridad, []),
        aparcamiento: safeJsonParse(updatedBuilding.aparcamiento, []),
        imagenes_secundarias: safeJsonParse(updatedBuilding.imagenes_secundarias, [])
      },
      message: 'Edificio actualizado exitosamente' 
    })

  } catch (error: any) {
    console.error('Error al actualizar edificio:', error)
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al actualizar edificio' },
      { status: 500 }
    )
  }
} 