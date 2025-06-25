import { Client } from 'pg'
import { NextResponse } from 'next/server'

export async function GET() {
  const client = new Client({
    host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    database: 'dauaho3sghau5i',
    user: 'ufcmrjr46j97t8',
    port: 5432,
    password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    
    // Ejecutar una consulta simple para verificar que la conexión funciona
    const result = await client.query('SELECT 1 as test')
    
    await client.end()
    
    return NextResponse.json({ 
      connected: true, 
      message: 'Conexión exitosa a PostgreSQL',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error)
    
    return NextResponse.json({ 
      connected: false, 
      message: 'Error de conexión a PostgreSQL',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 