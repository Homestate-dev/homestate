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

async function checkTransactionStructure() {
  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE TRANSACCIONES_DEPARTAMENTOS');
    console.log('=======================================================\n');
    
    const client = await pool.connect();
    
    // Verificar estructura de la tabla
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla:');
    columns.rows.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n📊 Datos de ejemplo:');
    const data = await client.query(`
      SELECT 
        td.*,
        a.nombre as agente_nombre,
        e.nombre as edificio_nombre,
        d.numero as departamento_numero
      FROM transacciones_departamentos td
      LEFT JOIN administradores a ON td.agente_id = a.id
      LEFT JOIN departamentos d ON td.departamento_id = d.id
      LEFT JOIN edificios e ON d.edificio_id = e.id
      LIMIT 3
    `);
    
    data.rows.forEach((row, index) => {
      console.log(`\n   Registro ${index + 1}:`);
      console.log(`   - ID: ${row.id}`);
      console.log(`   - Cliente: ${row.cliente_nombre}`);
      console.log(`   - Tipo: ${row.tipo_transaccion}`);
      console.log(`   - Valor: ${row.precio_final || row.valor_transaccion}`);
      console.log(`   - Agente: ${row.agente_nombre}`);
      console.log(`   - Edificio: ${row.edificio_nombre}`);
      console.log(`   - Departamento: ${row.departamento_numero}`);
      console.log(`   - Estado: ${row.estado_actual}`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTransactionStructure(); 