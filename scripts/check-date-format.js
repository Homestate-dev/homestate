const { Pool } = require('pg');

const pool = new Pool({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDateFormat() {
  try {
    console.log('🔍 Verificando formato de fechas en la base de datos...\n');
    
    const client = await pool.connect();
    
    // Verificar la estructura de la tabla
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' AND column_name LIKE '%fecha%'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de fecha:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Verificar algunos registros con fechas
    const data = await client.query(`
      SELECT 
        id,
        fecha_transaccion,
        fecha_registro,
        fecha_ultimo_estado,
        tipo_transaccion,
        cliente_nombre
      FROM transacciones_departamentos 
      LIMIT 3
    `);
    
    console.log('\n📊 Datos de ejemplo:');
    data.rows.forEach((row, index) => {
      console.log(`\nRegistro ${index + 1}:`);
      console.log(`- ID: ${row.id}`);
      console.log(`- Tipo: ${row.tipo_transaccion}`);
      console.log(`- Cliente: ${row.cliente_nombre}`);
      console.log(`- Fecha transacción: ${row.fecha_transaccion} (tipo: ${typeof row.fecha_transaccion})`);
      console.log(`- Fecha registro: ${row.fecha_registro} (tipo: ${typeof row.fecha_registro})`);
      console.log(`- Fecha último estado: ${row.fecha_ultimo_estado} (tipo: ${typeof row.fecha_ultimo_estado})`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDateFormat(); 