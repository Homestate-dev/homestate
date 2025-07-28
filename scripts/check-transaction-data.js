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

async function checkTransactionData() {
  try {
    await client.connect()
    console.log('🔍 VERIFICANDO DATOS DE TRANSACCIÓN')
    console.log('====================================\n')
    
    // Verificar la transacción más reciente
    const result = await client.query(`
      SELECT 
        id,
        departamento_id,
        agente_id,
        tipo_transaccion,
        precio_final,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        cliente_cedula,
        cliente_tipo_documento,
        fecha_transaccion,
        estado_actual,
        creado_por
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 1
    `)
    
    if (result.rows.length > 0) {
      const transaction = result.rows[0]
      console.log('📋 Última transacción creada:')
      console.log(`   - ID: ${transaction.id}`)
      console.log(`   - Departamento ID: ${transaction.departamento_id}`)
      console.log(`   - Agente ID: ${transaction.agente_id}`)
      console.log(`   - Tipo: ${transaction.tipo_transaccion}`)
      console.log(`   - Valor: ${transaction.precio_final}`)
      console.log(`   - Cliente: ${transaction.cliente_nombre || 'NULL'}`)
      console.log(`   - Email: ${transaction.cliente_email || 'NULL'}`)
      console.log(`   - Teléfono: ${transaction.cliente_telefono || 'NULL'}`)
      console.log(`   - Cédula: ${transaction.cliente_cedula || 'NULL'}`)
      console.log(`   - Tipo documento: ${transaction.cliente_tipo_documento || 'NULL'}`)
      console.log(`   - Estado: ${transaction.estado_actual}`)
      console.log(`   - Creado por: ${transaction.creado_por}`)
      
      if (!transaction.cliente_nombre) {
        console.log('\n❌ PROBLEMA: Los datos del cliente están NULL')
        console.log('   Esto indica que hay un problema en la API')
      } else {
        console.log('\n✅ Los datos del cliente se guardaron correctamente')
      }
    } else {
      console.log('❌ No se encontraron transacciones')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkTransactionData() 