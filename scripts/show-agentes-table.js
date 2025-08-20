const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

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

async function showAgentesTable() {
  const pool = new Pool(dbConfig);
  let output = '';
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    output += '🔍 Conectando a la base de datos...\n\n';
    
    // Obtener información de la tabla agentes_inmobiliarios
    const tableQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'agentes_inmobiliarios';
    `;
    
    const tableResult = await pool.query(tableQuery);
    
    if (tableResult.rows.length === 0) {
      const message = '❌ No se encontró la tabla agentes_inmobiliarios';
      console.log(message);
      output += message + '\n';
      return;
    }
    
    const table = tableResult.rows[0];
    
    // Imprimir información de la tabla
    const tableInfo = `📋 Tabla: ${table.tablename}
   Propietario: ${table.tableowner}
   Esquema: ${table.schemaname}`;
    
    console.log(tableInfo);
    output += tableInfo + '\n';
    
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
      AND table_name = 'agentes_inmobiliarios'
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await pool.query(columnsQuery);
    const columns = columnsResult.rows;
    
    const columnsInfo = `   📝 Columnas (${columns.length}):`;
    console.log(columnsInfo);
    output += columnsInfo + '\n';
    
    if (columns.length === 0) {
      const message = '      ❌ No se encontraron columnas';
      console.log(message);
      output += message + '\n';
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
        output += columnInfo + '\n';
      });
    }
    
    // Obtener información sobre índices
    const indexesQuery = `
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'agentes_inmobiliarios'
      ORDER BY indexname;
    `;
    
    const indexesResult = await pool.query(indexesQuery);
    const indexes = indexesResult.rows;
    
    if (indexes.length > 0) {
      const indexesInfo = `   🔍 Índices (${indexes.length}):`;
      console.log(indexesInfo);
      output += indexesInfo + '\n';
      
      indexes.forEach((index, idxIndex) => {
        const indexInfo = `      ${idxIndex + 1}. ${index.indexname}`;
        console.log(indexInfo);
        output += indexInfo + '\n';
      });
    }
    
    // Obtener información sobre restricciones
    const constraintsQuery = `
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' 
      AND tc.table_name = 'agentes_inmobiliarios'
      ORDER BY tc.constraint_name;
    `;
    
    const constraintsResult = await pool.query(constraintsQuery);
    const constraints = constraintsResult.rows;
    
    if (constraints.length > 0) {
      const constraintsInfo = `   🔒 Restricciones (${constraints.length}):`;
      console.log(constraintsInfo);
      output += constraintsInfo + '\n';
      
      constraints.forEach((constraint, constIndex) => {
        const constraintInfo = `      ${constIndex + 1}. ${constraint.constraint_name} (${constraint.constraint_type})`;
        console.log(constraintInfo);
        output += constraintInfo + '\n';
      });
    }
    
    // Obtener datos de ejemplo (primeras 5 filas)
    const sampleDataQuery = `
      SELECT * FROM agentes_inmobiliarios 
      ORDER BY id 
      LIMIT 5;
    `;
    
    const sampleDataResult = await pool.query(sampleDataQuery);
    const sampleData = sampleDataResult.rows;
    
    if (sampleData.length > 0) {
      const sampleDataInfo = `\n📊 Datos de ejemplo (primeras ${sampleData.length} filas):`;
      console.log(sampleDataInfo);
      output += sampleDataInfo + '\n';
      
      sampleData.forEach((row, rowIndex) => {
        const rowInfo = `   Fila ${rowIndex + 1}:`;
        console.log(rowInfo);
        output += rowInfo + '\n';
        
        Object.entries(row).forEach(([key, value]) => {
          const fieldInfo = `      ${key}: ${value}`;
          console.log(fieldInfo);
          output += fieldInfo + '\n';
        });
        console.log('');
        output += '\n';
      });
    }
    
    // Estadísticas de la tabla
    const countQuery = `SELECT COUNT(*) as total FROM agentes_inmobiliarios;`;
    const countResult = await pool.query(countQuery);
    const totalRows = countResult.rows[0].total;
    
    const statsInfo = `📈 Estadísticas de la tabla:
   • Total de filas: ${totalRows}
   • Total de columnas: ${columns.length}
   • Total de índices: ${indexes.length}
   • Total de restricciones: ${constraints.length}`;
    
    console.log(statsInfo);
    output += statsInfo + '\n';
    
    // Guardar en archivo
    const outputPath = path.join(__dirname, 'agentes.txt');
    await fs.writeFile(outputPath, output, 'utf8');
    
    console.log(`\n💾 Información guardada en: ${outputPath}`);
    console.log('✅ Script completado exitosamente.');
    
  } catch (error) {
    const errorMessage = `❌ Error al ejecutar el script: ${error.message}`;
    console.error(errorMessage);
    output += errorMessage + '\n';
    
    // Intentar guardar el error también
    try {
      const outputPath = path.join(__dirname, 'agentes.txt');
      await fs.writeFile(outputPath, output, 'utf8');
      console.log(`💾 Información parcial guardada en: ${outputPath}`);
    } catch (writeError) {
      console.error('❌ Error al guardar archivo:', writeError.message);
    }
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
showAgentesTable().catch(console.error);
