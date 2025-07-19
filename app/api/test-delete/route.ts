import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Test DELETE endpoint called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test endpoint working correctly',
      receivedData: body
    })
    
  } catch (error: any) {
    console.error('Error in test DELETE endpoint:', error)
    
    return NextResponse.json(
      { success: false, error: 'Error en endpoint de prueba' },
      { status: 500 }
    )
  }
} 