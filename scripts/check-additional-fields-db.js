const { Pool } = require('pg');

// Configuración exacta de la base de datos de Heroku (igual que tus otros scripts)
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

async function checkAdditionalFields() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar que las columnas existen
    console.log('\n🔍 1. Verificando estructura de columnas...');
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_ventas_arriendos'
      AND column_name IN ('referido_por', 'canal_captacion', 'fecha_primer_contacto', 'notas', 'observaciones')
      ORDER BY column_name;
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('📋 Columnas encontradas:');
    columnsResult.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    if (columnsResult.rows.length < 5) {
      console.log('❌ Faltan columnas! Esperadas: 5, encontradas:', columnsResult.rows.length);
    }

    // 2. Verificar la transacción específica (ID 103)
    console.log('\n🔍 2. Verificando transacción ID 103...');
    const specificQuery = `
      SELECT 
        id,
        cliente_nombre,
        referido_por,
        canal_captacion,
        fecha_primer_contacto,
        notas,
        observaciones,
        fecha_registro
      FROM transacciones_ventas_arriendos 
      WHERE id = 103;
    `;
    
    const specificResult = await client.query(specificQuery);
    if (specificResult.rows.length > 0) {
      const row = specificResult.rows[0];
      console.log('📄 Datos de transacción ID 103:');
      console.log(`  Cliente: ${row.cliente_nombre}`);
      console.log(`  Referido por: ${row.referido_por || 'NULL'}`);
      console.log(`  Canal captación: ${row.canal_captacion || 'NULL'}`);
      console.log(`  Fecha primer contacto: ${row.fecha_primer_contacto || 'NULL'}`);
      console.log(`  Notas: ${row.notas || 'NULL'}`);
      console.log(`  Observaciones: ${row.observaciones || 'NULL'}`);
      console.log(`  Fecha registro: ${row.fecha_registro}`);
    } else {
      console.log('❌ No se encontró la transacción ID 103');
    }

    // 3. Verificar las últimas 3 transacciones
    console.log('\n🔍 3. Verificando últimas 3 transacciones...');
    const recentQuery = `
      SELECT 
        id,
        cliente_nombre,
        referido_por,
        canal_captacion,
        fecha_primer_contacto,
        notas,
        observaciones,
        fecha_registro
      FROM transacciones_ventas_arriendos 
      ORDER BY fecha_registro DESC 
      LIMIT 3;
    `;
    
    const recentResult = await client.query(recentQuery);
    console.log('📊 Últimas 3 transacciones:');
    recentResult.rows.forEach((row, index) => {
      console.log(`\n--- Transacción ${index + 1} (ID: ${row.id}) ---`);
      console.log(`  Cliente: ${row.cliente_nombre}`);
      console.log(`  Referido por: ${row.referido_por || 'NULL'}`);
      console.log(`  Canal captación: ${row.canal_captacion || 'NULL'}`);
      console.log(`  Fecha primer contacto: ${row.fecha_primer_contacto || 'NULL'}`);
      console.log(`  Notas: ${row.notas || 'NULL'}`);
      console.log(`  Observaciones: ${row.observaciones || 'NULL'}`);
    });

    // 4. Estadísticas de campos adicionales
    console.log('\n📈 4. Estadísticas de campos adicionales...');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transacciones,
        COUNT(referido_por) as con_referido,
        COUNT(canal_captacion) as con_canal,
        COUNT(fecha_primer_contacto) as con_fecha_contacto,
        COUNT(notas) as con_notas,
        COUNT(observaciones) as con_observaciones
      FROM transacciones_ventas_arriendos;
    `;
    
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];
    console.log(`Total transacciones: ${stats.total_transacciones}`);
    console.log(`Con referido por: ${stats.con_referido}`);
    console.log(`Con canal captación: ${stats.con_canal}`);
    console.log(`Con fecha primer contacto: ${stats.con_fecha_contacto}`);
    console.log(`Con notas: ${stats.con_notas}`);
    console.log(`Con observaciones: ${stats.con_observaciones}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
  }
}

checkAdditionalFields().catch(console.error);
