import { NextRequest, NextResponse } from 'next/server'
import { getAgents, createAgent, logAdminAction } from '@/lib/database'

export async function GET() {
  try {
    const agents = await getAgents()
    return NextResponse.json({ success: true, data: agents })
  } catch (error: any) {
    console.error('Error al obtener agentes:', error)
    
    // Si hay problemas de estructura, devolver array vacío
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'Estructura de base de datos no configurada. Necesita ejecutar migración.'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al obtener agentes inmobiliarios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nombre, 
      email, 
      telefono,
      cedula,
      especialidad,
      comision_ventas,
      comision_arriendos,
      foto_perfil,
      biografia,
      fecha_ingreso,
      currentUserUid 
    } = body

    console.log('Datos recibidos para crear agente:', { nombre, email, especialidad })

    if (!nombre || !email || !especialidad) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y especialidad son requeridos' },
        { status: 400 }
      )
    }

    if (!currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Generar firebase_uid único para el agente
    const firebase_uid = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const agentData = {
      firebase_uid,
      nombre,
      email,
      telefono,
      cedula,
      especialidad,
      comision_ventas,
      comision_arriendos,
      foto_perfil,
      biografia,
      fecha_ingreso,
      creado_por: currentUserUid
    }

    console.log('Intentando crear agente con datos:', agentData)

    const newAgent = await createAgent(agentData)

    console.log('Agente creado exitosamente:', newAgent)

    // Comentar temporalmente el logAdminAction hasta que las tablas estén configuradas
    try {
      await logAdminAction(
        currentUserUid,
        `Creó nuevo agente inmobiliario: ${nombre}`,
        'creación',
        { agent_created: newAgent.id, agent_name: nombre, especialidad }
      )
    } catch (logError) {
      console.warn('Error al registrar acción de admin (tabla puede no existir):', logError)
      // No fallar por esto, es opcional
    }

    return NextResponse.json({ 
      success: true, 
      data: newAgent,
      message: 'Agente inmobiliario creado exitosamente' 
    })

  } catch (error: any) {
    console.error('Error detallado al crear agente:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error detail:', error.detail)
    
    let errorMessage = 'Error al crear agente inmobiliario'
    
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      errorMessage = 'La estructura de base de datos no está configurada. Contacte al administrador.'
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          needsSetup: true 
        },
        { status: 500 }
      )
    }
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint?.includes('email')) {
        errorMessage = 'Ya existe un agente con ese email'
      } else if (error.constraint?.includes('cedula')) {
        errorMessage = 'Ya existe un agente con esa cédula'
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage, details: error.message },
      { status: 500 }
    )
  }
} 