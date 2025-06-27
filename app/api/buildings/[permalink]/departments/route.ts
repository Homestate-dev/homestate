import { NextRequest, NextResponse } from 'next/server'
import { getBuildingWithDepartmentsByPermalink } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ permalink: string }> }
) {
  try {
    const { permalink } = await params

    if (!permalink) {
      return NextResponse.json({ 
        success: false, 
        error: 'Permalink es requerido' 
      }, { status: 400 })
    }

    const data = await getBuildingWithDepartmentsByPermalink(permalink)
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Edificio no encontrado' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data 
    })

  } catch (error) {
    console.error('Error al obtener edificio con departamentos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 