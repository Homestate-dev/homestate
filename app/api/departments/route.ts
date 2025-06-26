import { NextRequest, NextResponse } from 'next/server'
import { createDepartment, getDepartmentsByBuilding, logAdminAction } from '@/lib/database'
import { uploadImageToFirebase } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const edificio_id = searchParams.get('edificio_id')

    if (!edificio_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'edificio_id es requerido' 
      }, { status: 400 })
    }

    const departments = await getDepartmentsByBuilding(parseInt(edificio_id))
    
    return NextResponse.json({ 
      success: true, 
      data: departments 
    })

  } catch (error) {
    console.error('Error al obtener departamentos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extraer datos del departamento
    const departmentData = {
      edificio_id: parseInt(formData.get('edificio_id') as string),
      numero: formData.get('numero') as string,
      nombre: formData.get('nombre') as string,
      piso: parseInt(formData.get('piso') as string),
      area: parseFloat(formData.get('area') as string),
      valor_arriendo: parseInt(formData.get('valor_arriendo') as string) || 0,
      valor_venta: parseInt(formData.get('valor_venta') as string) || 0,
      cantidad_habitaciones: formData.get('cantidad_habitaciones') as string,
      tipo: formData.get('tipo') as string,
      estado: formData.get('estado') as string,
      ideal_para: formData.get('ideal_para') as string,
      amueblado: formData.get('amueblado') === 'true',
      tiene_living_comedor: formData.get('tiene_living_comedor') === 'true',
      tiene_cocina_separada: formData.get('tiene_cocina_separada') === 'true',
      tiene_antebano: formData.get('tiene_antebano') === 'true',
      tiene_bano_completo: formData.get('tiene_bano_completo') === 'true',
      tiene_aire_acondicionado: formData.get('tiene_aire_acondicionado') === 'true',
      tiene_placares: formData.get('tiene_placares') === 'true',
      tiene_cocina_con_horno_y_anafe: formData.get('tiene_cocina_con_horno_y_anafe') === 'true',
      tiene_muebles_bajo_mesada: formData.get('tiene_muebles_bajo_mesada') === 'true',
      tiene_desayunador_madera: formData.get('tiene_desayunador_madera') === 'true',
      creado_por: formData.get('currentUserUid') as string
    }

    // Extraer el permalink del edificio para organizar las imágenes
    const buildingPermalink = formData.get('buildingPermalink') as string
    
    // Procesar imágenes
    const imageUrls: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      if (file && file.size > 0) {
        try {
          // Subir imagen a Firebase en la carpeta del edificio
          const imagePath = `buildings/${buildingPermalink}/departments/${departmentData.numero}/${Date.now()}_${i}`
          const imageUrl = await uploadImageToFirebase(file, imagePath)
          imageUrls.push(imageUrl)
        } catch (error) {
          console.error(`Error subiendo imagen ${i}:`, error)
          // Continuar con las demás imágenes aunque falle una
        }
      }
    }

    // Crear departamento en la base de datos
    const newDepartment = await createDepartment({
      ...departmentData,
      imagenes: imageUrls
    })

    // Registrar la acción del administrador
    await logAdminAction(
      departmentData.creado_por,
      `Creó el departamento ${departmentData.numero} en el edificio ID ${departmentData.edificio_id}`,
      'creación',
      {
        departamento_id: newDepartment.id,
        edificio_id: departmentData.edificio_id,
        numero: departmentData.numero,
        imagenes_count: imageUrls.length
      }
    )

    return NextResponse.json({ 
      success: true, 
      data: newDepartment,
      message: 'Departamento creado exitosamente'
    })

  } catch (error: any) {
    console.error('Error al crear departamento:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 