const { Pool } = require('pg');

const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
};

async function showAllTablesAndColumns() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    
    // Obtener todas las tablas
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows;
    
    console.log(`📊 Se encontraron ${tables.length} tablas en el esquema 'public':\n`);
    
    if (tables.length === 0) {
      console.log('❌ No se encontraron tablas en el esquema público.');
      return;
    }
    
    // Para cada tabla, obtener sus columnas
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      console.log(`\n${i + 1}. 📋 Tabla: ${table.tablename}`);
      console.log(`   Propietario: ${table.tableowner}`);
      console.log(`   Esquema: ${table.schemaname}`);
      
      // Obtener columnas de la tabla
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(columnsQuery, [table.tablename]);
      const columns = columnsResult.rows;
      
      console.log(`   📝 Columnas (${columns.length}):`);
      
      if (columns.length === 0) {
        console.log('      ❌ No se encontraron columnas');
      } else {
        columns.forEach((column, colIndex) => {
          let columnInfo = `      ${colIndex + 1}. ${column.column_name}`;
          columnInfo += ` (${column.data_type}`;
          
          if (column.character_maximum_length) {
            columnInfo += `(${column.character_maximum_length})`;
          } else if (column.numeric_precision) {
            columnInfo += `(${column.numeric_precision}`;
            if (column.numeric_scale) {
              columnInfo += `,${column.numeric_scale}`;
            }
            columnInfo += ')';
          }
          
          columnInfo += ')';
          
          if (column.is_nullable === 'NO') {
            columnInfo += ' NOT NULL';
          }
          
          if (column.column_default) {
            columnInfo += ` DEFAULT ${column.column_default}`;
          }
          
          console.log(columnInfo);
        });
      }
      
      // Obtener información adicional sobre índices
      const indexesQuery = `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1
        ORDER BY indexname;
      `;
      
      const indexesResult = await pool.query(indexesQuery, [table.tablename]);
      const indexes = indexesResult.rows;
      
      if (indexes.length > 0) {
        console.log(`   🔍 Índices (${indexes.length}):`);
        indexes.forEach((index, idxIndex) => {
          console.log(`      ${idxIndex + 1}. ${index.indexname}`);
        });
      }
      
      // Obtener información sobre restricciones
      const constraintsQuery = `
        SELECT 
          constraint_name,
          constraint_type,
          column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
        AND tc.table_name = $1
        ORDER BY tc.constraint_name;
      `;
      
      const constraintsResult = await pool.query(constraintsQuery, [table.tablename]);
      const constraints = constraintsResult.rows;
      
      if (constraints.length > 0) {
        console.log(`   🔒 Restricciones (${constraints.length}):`);
        constraints.forEach((constraint, constIndex) => {
          console.log(`      ${constIndex + 1}. ${constraint.constraint_name} (${constraint.constraint_type})`);
        });
      }
      
      console.log('   ' + '─'.repeat(50));
    }
    
    // Resumen final
    console.log(`\n🎯 RESUMEN:`);
    console.log(`   • Total de tablas: ${tables.length}`);
    
    let totalColumns = 0;
    for (const table of tables) {
      const columnsResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
      `, [table.tablename]);
      totalColumns += parseInt(columnsResult.rows[0].count);
    }
    
    console.log(`   • Total de columnas: ${totalColumns}`);
    console.log(`\n✅ Script completado exitosamente.`);
    
  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
showAllTablesAndColumns().catch(console.error);
