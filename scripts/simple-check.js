const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: { rejectUnauthorized: false }
})

async function check() {
  try {
    await client.connect()
    console.log('Verificando transacción...')
    
    const result = await client.query(`
      SELECT id, cliente_nombre, cliente_email, cliente_telefono 
      FROM transacciones_departamentos 
      ORDER BY id DESC LIMIT 1
    `)
    
    if (result.rows.length > 0) {
      const t = result.rows[0]
      console.log(`ID: ${t.id}`)
      console.log(`Cliente: ${t.cliente_nombre || 'NULL'}`)
      console.log(`Email: ${t.cliente_email || 'NULL'}`)
      console.log(`Teléfono: ${t.cliente_telefono || 'NULL'}`)
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

check() 