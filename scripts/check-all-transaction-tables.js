const { Pool } = require('pg');

// Configuración exacta de la base de datos de Heroku
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

async function checkAllTransactionTables() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar qué tablas de transacciones existen
    console.log('\n🔍 1. Verificando tablas de transacciones...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('transacciones_departamentos', 'transacciones_ventas_arriendos')
      AND table_schema = 'public';
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Tablas de transacciones encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    // 2. Verificar contenido de cada tabla
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n🔍 2. Verificando contenido de ${tableName}...`);
      
      // Contar registros
      const countQuery = `SELECT COUNT(*) as total FROM ${tableName};`;
      const countResult = await client.query(countQuery);
      console.log(`📊 Total registros en ${tableName}: ${countResult.rows[0].total}`);

      // Si hay registros, mostrar las últimas 3 transacciones
      if (countResult.rows[0].total > 0) {
        console.log(`\n📄 Últimas 3 transacciones en ${tableName}:`);
        
        // Verificar qué columnas existen en esta tabla
        const columnsQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}'
          AND column_name IN ('id', 'cliente_nombre', 'referido_por', 'canal_captacion', 'fecha_primer_contacto', 'notas', 'observaciones', 'fecha_registro', 'fecha_transaccion')
          ORDER BY column_name;
        `;
        
        const columnsResult = await client.query(columnsQuery);
        const availableColumns = columnsResult.rows.map(row => row.column_name);
        console.log(`   Columnas disponibles: ${availableColumns.join(', ')}`);

        // Construir query dinámicamente según las columnas disponibles
        const selectColumns = availableColumns.join(', ');
        const orderColumn = availableColumns.includes('fecha_registro') ? 'fecha_registro' : 
                           availableColumns.includes('fecha_transaccion') ? 'fecha_transaccion' : 'id';
        
        const dataQuery = `
          SELECT ${selectColumns}
          FROM ${tableName} 
          ORDER BY ${orderColumn} DESC 
          LIMIT 3;
        `;
        
        const dataResult = await client.query(dataQuery);
        dataResult.rows.forEach((row, index) => {
          console.log(`\n   --- Transacción ${index + 1} (ID: ${row.id}) ---`);
          if (row.cliente_nombre) console.log(`     Cliente: ${row.cliente_nombre}`);
          if (availableColumns.includes('referido_por')) console.log(`     Referido por: ${row.referido_por || 'NULL'}`);
          if (availableColumns.includes('canal_captacion')) console.log(`     Canal captación: ${row.canal_captacion || 'NULL'}`);
          if (availableColumns.includes('fecha_primer_contacto')) console.log(`     Fecha primer contacto: ${row.fecha_primer_contacto || 'NULL'}`);
          if (availableColumns.includes('notas')) console.log(`     Notas: ${row.notas || 'NULL'}`);
          if (availableColumns.includes('observaciones')) console.log(`     Observaciones: ${row.observaciones || 'NULL'}`);
        });

        // Buscar específicamente la transacción ID 103
        console.log(`\n🔍 Buscando transacción ID 103 en ${tableName}...`);
        const searchQuery = `SELECT ${selectColumns} FROM ${tableName} WHERE id = 103;`;
        const searchResult = await client.query(searchQuery);
        
        if (searchResult.rows.length > 0) {
          console.log(`✅ ¡Encontrada transacción ID 103 en ${tableName}!`);
          const row = searchResult.rows[0];
          console.log(`   Cliente: ${row.cliente_nombre || 'NULL'}`);
          if (availableColumns.includes('referido_por')) console.log(`   Referido por: ${row.referido_por || 'NULL'}`);
          if (availableColumns.includes('canal_captacion')) console.log(`   Canal captación: ${row.canal_captacion || 'NULL'}`);
          if (availableColumns.includes('fecha_primer_contacto')) console.log(`   Fecha primer contacto: ${row.fecha_primer_contacto || 'NULL'}`);
          if (availableColumns.includes('notas')) console.log(`   Notas: ${row.notas || 'NULL'}`);
          if (availableColumns.includes('observaciones')) console.log(`   Observaciones: ${row.observaciones || 'NULL'}`);
        } else {
          console.log(`❌ No se encontró transacción ID 103 en ${tableName}`);
        }
      }
    }

    // 3. Mostrar estructura completa de columnas para ambas tablas
    console.log('\n🔍 3. Estructura completa de columnas...');
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n📋 Columnas en ${tableName}:`);
      
      const allColumnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;
      
      const allColumnsResult = await client.query(allColumnsQuery);
      allColumnsResult.rows.forEach(row => {
        const hasData = ['referido_por', 'canal_captacion', 'fecha_primer_contacto', 'notas', 'observaciones'].includes(row.column_name) ? ' 🎯' : '';
        console.log(`  ${row.column_name}: ${row.data_type}${hasData}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
  }
}

checkAllTransactionTables().catch(console.error);

