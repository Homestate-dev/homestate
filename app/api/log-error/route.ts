import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()
    
    // Log del error en el servidor
    console.error('🔥 CLIENT ERROR RECEIVED:', {
      timestamp: new Date().toISOString(),
      url: errorData.url,
      userAgent: errorData.userAgent,
      error: errorData.error,
      isReactError310: errorData.isReactError310,
      errorId: errorData.errorId
    })

    // Si es el error React #310, agregar información adicional
    if (errorData.isReactError310) {
      console.error('🚨 REACT ERROR #310 DETAILS:', {
        message: errorData.error.message,
        stack: errorData.error.stack,
        componentStack: errorData.errorInfo?.componentStack,
        errorId: errorData.errorId
      })
    }

    // En un entorno real, aquí enviarías los datos a un servicio de monitoreo
    // como Sentry, LogRocket, o tu propio sistema de logging
    
    // Por ahora, solo log en consola y responder exitosamente
    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully',
      errorId: errorData.errorId 
    })
    
  } catch (error) {
    console.error('Failed to log client error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to log error' },
      { status: 500 }
    )
  }
} 