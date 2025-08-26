const { Client } = require('pg');

async function testAdditionalFields() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar la estructura de la tabla
    console.log('\n📋 Verificando estructura de la tabla transacciones_ventas_arriendos...');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_ventas_arriendos'
      AND column_name IN ('referido_por', 'canal_captacion', 'fecha_primer_contacto', 'notas', 'observaciones')
      ORDER BY column_name;
    `;
    
    const structureResult = await client.query(structureQuery);
    console.log('Columnas encontradas:');
    structureResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Verificar datos en las últimas transacciones
    console.log('\n📊 Verificando datos en las últimas 5 transacciones...');
    const dataQuery = `
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
      LIMIT 5;
    `;
    
    const dataResult = await client.query(dataQuery);
    console.log('\nDatos encontrados:');
    dataResult.rows.forEach((row, index) => {
      console.log(`\n--- Transacción ${index + 1} (ID: ${row.id}) ---`);
      console.log(`Cliente: ${row.cliente_nombre}`);
      console.log(`Referido por: ${row.referido_por || 'NULL'}`);
      console.log(`Canal captación: ${row.canal_captacion || 'NULL'}`);
      console.log(`Fecha primer contacto: ${row.fecha_primer_contacto || 'NULL'}`);
      console.log(`Notas: ${row.notas || 'NULL'}`);
      console.log(`Observaciones: ${row.observaciones || 'NULL'}`);
      console.log(`Fecha registro: ${row.fecha_registro}`);
    });

    // Contar cuántas transacciones tienen datos adicionales
    console.log('\n📈 Estadísticas de campos adicionales...');
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
  } finally {
    await client.end();
  }
}

testAdditionalFields();
