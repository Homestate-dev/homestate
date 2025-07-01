import { NextRequest, NextResponse } from 'next/server'
import { getAgents, createAgent, logAdminAction } from '@/lib/database'

export async function GET() {
  try {
    const agents = await getAgents()
    return NextResponse.json({ success: true, data: agents })
  } catch (error) {
    console.error('Error al obtener agentes:', error)
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

    const agentData = {
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

    const newAgent = await createAgent(agentData)

    // Registrar acción del administrador
    await logAdminAction(
      currentUserUid,
      `Creó nuevo agente inmobiliario: ${nombre}`,
      'creación',
      { agent_created: newAgent.id, agent_name: nombre, especialidad }
    )

    return NextResponse.json({ 
      success: true, 
      data: newAgent,
      message: 'Agente inmobiliario creado exitosamente' 
    })

  } catch (error: any) {
    console.error('Error al crear agente:', error)
    
    let errorMessage = 'Error al crear agente inmobiliario'
    
    if (error.code === '23505') { // Unique violation
      if (error.constraint?.includes('email')) {
        errorMessage = 'Ya existe un agente con ese email'
      } else if (error.constraint?.includes('cedula')) {
        errorMessage = 'Ya existe un agente con esa cédula'
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
} 