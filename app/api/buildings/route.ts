import { NextRequest, NextResponse } from 'next/server'
import { getBuildings, createBuilding, logAdminAction } from '@/lib/database'

export async function GET() {
  try {
    const buildings = await getBuildings()
    return NextResponse.json({ success: true, data: buildings })
  } catch (error) {
    console.error('Error al obtener edificios:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener edificios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nombre, 
      direccion, 
      permalink,
      costo_expensas,
      areas_comunales,
      seguridad,
      aparcamiento,
      descripcion,
      url_imagen_principal,
      imagenes_secundarias,
      currentUserUid 
    } = body

    if (!nombre || !direccion || !permalink || !url_imagen_principal) {
      return NextResponse.json(
        { success: false, error: 'Nombre, dirección, permalink e imagen principal son requeridos' },
        { status: 400 }
      )
    }

    const buildingData = {
      nombre,
      direccion,
      permalink,
      costo_expensas: costo_expensas || 0,
      areas_comunales: areas_comunales || [],
      seguridad: seguridad || [],
      aparcamiento: aparcamiento || [],
      descripcion: descripcion || '',
      url_imagen_principal,
      imagenes_secundarias: imagenes_secundarias || [],
      creado_por: currentUserUid
    }

    const newBuilding = await createBuilding(buildingData)

    // Registrar acción del administrador
    if (currentUserUid) {
      await logAdminAction(
        currentUserUid,
        `Creó nuevo edificio: ${nombre}`,
        'creación',
        { building_created: newBuilding.id, building_name: nombre }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: newBuilding,
      message: 'Edificio creado exitosamente' 
    })

  } catch (error: any) {
    console.error('Error al crear edificio:', error)
    
    let errorMessage = 'Error al crear edificio'
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint?.includes('permalink')) {
        errorMessage = 'Ya existe un edificio con ese permalink'
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 