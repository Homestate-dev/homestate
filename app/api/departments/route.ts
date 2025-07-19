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
      area_total: parseFloat(formData.get('area_total') as string),
      area_cubierta: formData.get('area_cubierta') ? parseFloat(formData.get('area_cubierta') as string) : null,
      area_descubierta: formData.get('area_descubierta') ? parseFloat(formData.get('area_descubierta') as string) : null,
      cantidad_banos: parseInt(formData.get('cantidad_banos') as string) || 1,
      valor_arriendo: parseInt(formData.get('valor_arriendo') as string) || 0,
      valor_venta: parseInt(formData.get('valor_venta') as string) || 0,
      alicuota: parseInt(formData.get('alicuota') as string) || 0,
      incluye_alicuota: formData.get('incluye_alicuota') === 'true',
      cantidad_habitaciones: formData.get('cantidad_habitaciones') as string,
      tipo: formData.get('tipo') as string,
      estado: formData.get('estado') as string,
      ideal_para: formData.get('ideal_para') as string,
      ambientes_y_adicionales: JSON.parse(formData.get('ambientes_y_adicionales') as string || '[]'),
      tiene_bodega: formData.get('tiene_bodega') === 'true',
      videos_url: JSON.parse(formData.get('videos_url') as string || '[]'),
      creado_por: formData.get('currentUserUid') as string
    }

    // Validar obligatoriedad de alicuota según tipo de transacción
    if ((departmentData.tipo === 'arriendo' || departmentData.tipo === 'arriendo y venta') && (departmentData.alicuota === 0)) {
      return NextResponse.json({
        success: false,
        error: 'El valor de la alícuota es obligatorio para departamentos en arriendo o arriendo y venta'
      }, { status: 400 })
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