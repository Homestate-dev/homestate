import { NextRequest, NextResponse } from 'next/server'
import { updateDepartment, getDepartmentById, logAdminAction } from '@/lib/database'
import { uploadImageToFirebase } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const departmentId = formData.get('departamento_id') as string
    const buildingPermalink = formData.get('buildingPermalink') as string
    const departmentNumber = formData.get('departamento_numero') as string
    const currentUserUid = formData.get('currentUserUid') as string
    
    if (!departmentId || !buildingPermalink || !departmentNumber || !currentUserUid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Datos requeridos faltantes' 
      }, { status: 400 })
    }

    const departmentIdInt = parseInt(departmentId)
    if (isNaN(departmentIdInt)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de departamento inválido' 
      }, { status: 400 })
    }

    // Obtener departamento actual
    const currentDepartment = await getDepartmentById(departmentIdInt)
    if (!currentDepartment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Departamento no encontrado' 
      }, { status: 404 })
    }

    // Obtener imágenes del formData
    const images = formData.getAll('images') as File[]
    
    if (images.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se proporcionaron imágenes' 
      }, { status: 400 })
    }

    // Subir imágenes a Firebase
    const imageUrls: string[] = []
    const uploadPromises = images.map(async (image, index) => {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${index}_${image.name}`
      const imagePath = `buildings/${buildingPermalink}/departments/${departmentNumber}/${fileName}`
      
      try {
        const imageUrl = await uploadImageToFirebase(image, imagePath)
        return imageUrl
      } catch (error) {
        console.error(`Error uploading image ${fileName}:`, error)
        throw new Error(`Error subiendo imagen ${image.name}`)
      }
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      imageUrls.push(...uploadedUrls)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Error al subir imágenes a Firebase'
      }, { status: 500 })
    }

    // Combinar imágenes existentes con las nuevas
    const allImages = [...currentDepartment.imagenes, ...imageUrls]

    // Actualizar departamento con nuevas imágenes
    const updatedDepartment = await updateDepartment(departmentIdInt, {
      imagenes: allImages
    })

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Agregó ${imageUrls.length} imagen(es) al departamento ID ${departmentIdInt}`,
      'edición',
      {
        departamento_id: departmentIdInt,
        imagenes_agregadas: imageUrls.length,
        total_imagenes: allImages.length
      }
    )

    return NextResponse.json({
      success: true,
      message: `${imageUrls.length} imagen(es) agregada(s) exitosamente`,
      imageUrls: imageUrls,
      department: updatedDepartment
    })

  } catch (error: any) {
    console.error('Error al subir imágenes:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
} 