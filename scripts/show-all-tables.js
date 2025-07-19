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

async function showAllTables() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️  CONSULTANDO TODAS LAS TABLAS DE LA BASE DE DATOS');
    console.log('=====================================================\n');
    
    // 1. Obtener todas las tablas
    const tables = await client.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tables.rows.length === 0) {
      console.log('❌ No se encontraron tablas en la base de datos.');
      return;
    }
    
    console.log(`📊 Total de tablas encontradas: ${tables.rows.length}\n`);
    
    // 2. Para cada tabla, obtener sus columnas
    for (const table of tables.rows) {
      console.log(`📋 TABLA: ${table.table_name.toUpperCase()}`);
      console.log('='.repeat(50));
      
      const columns = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [table.table_name]);
      
      if (columns.rows.length === 0) {
        console.log('   ❌ No se encontraron columnas para esta tabla.');
      } else {
        console.log(`   📝 Columnas (${columns.rows.length}):`);
        console.log('   ' + '─'.repeat(80));
        
        columns.rows.forEach((col, index) => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? `DEFAULT: ${col.column_default}` : '';
          const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
          const precision = col.numeric_precision ? `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})` : '';
          
          console.log(`   ${(index + 1).toString().padStart(2)}. ${col.column_name.padEnd(25)} | ${col.data_type}${length}${precision} | ${nullable} ${defaultVal}`);
        });
      }
      
      // 3. Mostrar algunos datos de ejemplo (si la tabla tiene datos)
      try {
        const sampleData = await client.query(`SELECT COUNT(*) as total FROM "${table.table_name}"`);
        const totalRows = sampleData.rows[0].total;
        
        if (totalRows > 0) {
          console.log(`   📊 Total de registros: ${totalRows}`);
          
          // Mostrar algunos registros de ejemplo (máximo 3)
          const sampleRows = await client.query(`SELECT * FROM "${table.table_name}" LIMIT 3`);
          if (sampleRows.rows.length > 0) {
            console.log('   📋 Ejemplos de datos:');
            sampleRows.rows.forEach((row, rowIndex) => {
              const rowData = Object.entries(row).map(([key, value]) => {
                if (value === null) return `${key}: NULL`;
                if (typeof value === 'object') return `${key}: [JSON]`;
                return `${key}: ${String(value).substring(0, 30)}${String(value).length > 30 ? '...' : ''}`;
              }).join(', ');
              console.log(`      ${rowIndex + 1}. ${rowData}`);
            });
          }
        } else {
          console.log('   📊 Total de registros: 0 (tabla vacía)');
        }
      } catch (error) {
        console.log(`   ⚠️  No se pudieron obtener datos de ejemplo: ${error.message}`);
      }
      
      console.log('\n');
    }
    
    // 4. Resumen final
    console.log('📈 RESUMEN FINAL');
    console.log('================');
    
    let totalColumns = 0;
    let totalRows = 0;
    
    for (const table of tables.rows) {
      const columns = await client.query(`
        SELECT COUNT(*) as count FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [table.table_name]);
      
      const rows = await client.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
      
      totalColumns += parseInt(columns.rows[0].count);
      totalRows += parseInt(rows.rows[0].count);
    }
    
    console.log(`Total de tablas: ${tables.rows.length}`);
    console.log(`Total de columnas: ${totalColumns}`);
    console.log(`Total de registros: ${totalRows}`);
    
  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
showAllTables().catch(console.error); 