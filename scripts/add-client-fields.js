#!/usr/bin/env node

const { Client } = require('pg')

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

async function addClientFields() {
  try {
    console.log('🔧 AGREGANDO CAMPOS DEL CLIENTE')
    console.log('================================\n')
    
    await client.connect()
    console.log('✅ Conexión establecida\n')
    
    // Agregar campos del cliente
    console.log('1. 📝 Agregando campos cliente_cedula y cliente_tipo_documento...')
    
    await client.query(`
      ALTER TABLE transacciones_departamentos 
      ADD COLUMN IF NOT EXISTS cliente_cedula VARCHAR(50),
      ADD COLUMN IF NOT EXISTS cliente_tipo_documento VARCHAR(20) DEFAULT 'CC'
    `)
    
    console.log('   ✅ Campos agregados exitosamente\n')
    
    // Verificar que se agregaron correctamente
    console.log('2. 🔍 Verificando estructura de la tabla...')
    
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' 
      AND column_name IN ('cliente_nombre', 'cliente_email', 'cliente_telefono', 'cliente_cedula', 'cliente_tipo_documento')
      ORDER BY ordinal_position
    `)
    
    console.log('   Campos del cliente en la tabla:')
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) - Default: ${col.column_default || 'none'}`)
    })
    
    console.log('\n🎉 Migración completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
  } finally {
    await client.end()
  }
}

addClientFields() 