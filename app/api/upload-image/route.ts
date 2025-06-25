import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseBucket } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const path = formData.get('path') as string

    if (!image || !path) {
      return NextResponse.json(
        { success: false, error: 'Imagen y ruta son requeridos' },
        { status: 400 }
      )
    }

    // Convertir File a Buffer
    const buffer = Buffer.from(await image.arrayBuffer())
    
    // Obtener bucket de Firebase Storage
    const bucket = getFirebaseBucket()
    const file = bucket.file(path)
    
    await file.save(buffer, {
      metadata: {
        contentType: image.type,
      },
      public: true,
    })

    // Generar URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: path
    })

  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir imagen' },
      { status: 500 }
    )
  }
} 