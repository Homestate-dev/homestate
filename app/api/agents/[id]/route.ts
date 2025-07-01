import { NextRequest, NextResponse } from 'next/server'
import { getAgentById, updateAgent, deleteAgent, logAdminAction } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id)
    if (isNaN(agentId)) {
      return NextResponse.json(
        { success: false, error: 'ID de agente inválido' },
        { status: 400 }
      )
    }

    const agent = await getAgentById(agentId)
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: agent })
  } catch (error) {
    console.error('Error al obtener agente:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id)
    if (isNaN(agentId)) {
      return NextResponse.json(
        { success: false, error: 'ID de agente inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      nombre,
      email,
      telefono,
      cedula,
      especialidad,
      comision_ventas,
      comision_arriendos,
      activo,
      foto_perfil,
      biografia,
      fecha_ingreso,
      currentUserUid 
    } = body

    if (!currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el agente existe
    const existingAgent = await getAgentById(agentId)
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    // Preparar los datos de actualización
    const updateData: any = {}
    
    if (nombre !== undefined) updateData.nombre = nombre
    if (email !== undefined) updateData.email = email
    if (telefono !== undefined) updateData.telefono = telefono
    if (cedula !== undefined) updateData.cedula = cedula
    if (especialidad !== undefined) updateData.especialidad = especialidad
    if (comision_ventas !== undefined) updateData.comision_ventas = comision_ventas
    if (comision_arriendos !== undefined) updateData.comision_arriendos = comision_arriendos
    if (activo !== undefined) updateData.activo = activo
    if (foto_perfil !== undefined) updateData.foto_perfil = foto_perfil
    if (biografia !== undefined) updateData.biografia = biografia
    if (fecha_ingreso !== undefined) updateData.fecha_ingreso = fecha_ingreso

    // Actualizar el agente
    const updatedAgent = await updateAgent(agentId, updateData)

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Actualizó agente inmobiliario: ${updatedAgent.nombre}`,
      'actualización',
      { 
        agent_updated: agentId, 
        agent_name: updatedAgent.nombre,
        fields_updated: Object.keys(updateData)
      }
    )

    return NextResponse.json({ 
      success: true, 
      data: updatedAgent,
      message: 'Agente actualizado exitosamente' 
    })

  } catch (error: any) {
    console.error('Error al actualizar agente:', error)
    
    let errorMessage = 'Error interno del servidor al actualizar agente'
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id)
    if (isNaN(agentId)) {
      return NextResponse.json(
        { success: false, error: 'ID de agente inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { currentUserUid, agentName } = body

    if (!currentUserUid) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Obtener los datos del agente antes de eliminarlo
    const agent = await getAgentById(agentId)
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el nombre coincida (seguridad adicional)
    if (agentName && agent.nombre !== agentName) {
      return NextResponse.json(
        { success: false, error: 'El nombre del agente no coincide' },
        { status: 400 }
      )
    }

    // Eliminar el agente de la base de datos
    const deletedAgent = await deleteAgent(agentId)
    
    if (!deletedAgent) {
      return NextResponse.json(
        { success: false, error: 'No se pudo eliminar el agente' },
        { status: 500 }
      )
    }

    // Registrar la acción del administrador
    await logAdminAction(
      currentUserUid,
      `Eliminó agente inmobiliario: ${agent.nombre}`,
      'eliminación',
      { 
        agent_deleted: agentId, 
        agent_name: agent.nombre,
        agent_email: agent.email
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Agente eliminado exitosamente',
      data: deletedAgent
    })

  } catch (error: any) {
    console.error('Error al eliminar agente:', error)
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al eliminar agente' },
      { status: 500 }
    )
  }
} 