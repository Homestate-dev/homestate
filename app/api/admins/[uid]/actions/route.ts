import { NextRequest, NextResponse } from 'next/server'
import { getAdminActions } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const firebase_uid = params.uid
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')

    if (!firebase_uid) {
      return NextResponse.json(
        { success: false, error: 'UID es requerido' },
        { status: 400 }
      )
    }

    const actions = await getAdminActions(firebase_uid, limit)

    return NextResponse.json({ 
      success: true, 
      data: actions,
      count: actions.length
    })

  } catch (error) {
    console.error('Error al obtener acciones del administrador:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener acciones del administrador' },
      { status: 500 }
    )
  }
} 