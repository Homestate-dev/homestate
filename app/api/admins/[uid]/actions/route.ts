import { NextRequest, NextResponse } from 'next/server'
import { getAdminActions } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    const actions = await getAdminActions(params.uid, limit)
    
    return NextResponse.json({ 
      success: true, 
      data: actions 
    })

  } catch (error) {
    console.error('Error al obtener acciones del administrador:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener acciones del administrador' },
      { status: 500 }
    )
  }
} 