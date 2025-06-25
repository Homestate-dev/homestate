import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { permalink: string } }
) {
  try {
    const permalink = params.permalink

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
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Edificio no encontrado' },
        { status: 404 }
      )
    }
    
    const building = result.rows[0]
    
    // Parsear los campos JSON
    const buildingData = {
      ...building,
      areas_comunales: building.areas_comunales ? JSON.parse(building.areas_comunales) : [],
      seguridad: building.seguridad ? JSON.parse(building.seguridad) : [],
      aparcamiento: building.aparcamiento ? JSON.parse(building.aparcamiento) : [],
      imagenes_secundarias: building.imagenes_secundarias ? JSON.parse(building.imagenes_secundarias) : []
    }

    return NextResponse.json({ 
      success: true, 
      data: buildingData 
    })

  } catch (error) {
    console.error('Error al obtener edificio por permalink:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 