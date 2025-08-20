import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos
const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
}

// GET - Obtener configuración actual
export async function GET() {
  const pool = new Pool(dbConfig)
  
  try {
    const client = await pool.connect()
    
    // Obtener la configuración más reciente
    const result = await client.query(`
      SELECT whatsapp_number, tally_link, updated_at 
      FROM page_configuration 
      ORDER BY updated_at DESC 
      LIMIT 1
    `)
    
    client.release()
    
    if (result.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    } else {
      // Si no hay configuración, devolver valores por defecto
      return NextResponse.json({
        success: true,
        data: {
          whatsapp_number: "",
          tally_link: "",
          updated_at: null
        }
      })
    }
    
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  } finally {
    await pool.end()
  }
}

// POST - Guardar/actualizar configuración
export async function POST(request: NextRequest) {
  const pool = new Pool(dbConfig)
  
  try {
    const body = await request.json()
    const { whatsapp_number, tally_link } = body
    
    // Validaciones básicas
    if (!whatsapp_number || !tally_link) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'whatsapp_number y tally_link son requeridos' 
        },
        { status: 400 }
      )
    }
    
    if (whatsapp_number.length > 20) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El número de WhatsApp es demasiado largo' 
        },
        { status: 400 }
      )
    }
    
    if (!tally_link.startsWith('http')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El enlace de Tally debe ser una URL válida' 
        },
        { status: 400 }
      )
    }
    
    const client = await pool.connect()
    
    // Verificar si ya existe configuración
    const existingConfig = await client.query(`
      SELECT id FROM page_configuration 
      ORDER BY updated_at DESC 
      LIMIT 1
    `)
    
    let result
    
    if (existingConfig.rows.length > 0) {
      // Actualizar configuración existente
      result = await client.query(`
        UPDATE page_configuration 
        SET whatsapp_number = $1, tally_link = $2 
        WHERE id = $3 
        RETURNING *
      `, [whatsapp_number, tally_link, existingConfig.rows[0].id])
    } else {
      // Crear nueva configuración
      result = await client.query(`
        INSERT INTO page_configuration (whatsapp_number, tally_link) 
        VALUES ($1, $2) 
        RETURNING *
      `, [whatsapp_number, tally_link])
    }
    
    client.release()
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: existingConfig.rows.length > 0 ? 'Configuración actualizada' : 'Configuración creada'
    })
    
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  } finally {
    await pool.end()
  }
}
