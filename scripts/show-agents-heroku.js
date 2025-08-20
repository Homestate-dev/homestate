const { Pool } = require('pg');

// Configuración específica para tu base de datos de Heroku
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

async function showAllAgentsHeroku() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ANALIZANDO AGENTES INMOBILIARIOS EN HEROKU...\n');
    console.log('🌐 Conectado a: c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com\n');
    
    // 1. Verificar estructura de la tabla
    console.log('📋 VERIFICANDO ESTRUCTURA DE LA TABLA...');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'administradores' 
      ORDER BY ordinal_position
    `;
    
    const structureResult = await client.query(structureQuery);
    console.log('Columnas disponibles en tabla administradores:');
    structureResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log('');
    
    // 2. Contar total de agentes
    const countQuery = `
      SELECT 
        COUNT(*) as total_agentes,
        COUNT(CASE WHEN es_agente = true THEN 1 END) as agentes_activos,
        COUNT(CASE WHEN es_agente = false THEN 1 END) as solo_administradores,
        COUNT(CASE WHEN activo = true THEN 1 END) as activos_en_sistema,
        COUNT(CASE WHEN activo = false THEN 1 END) as inactivos_en_sistema
      FROM administradores
    `;
    
    const countResult = await client.query(countQuery);
    const counts = countResult.rows[0];
    
    console.log('📊 ESTADÍSTICAS GENERALES:');
    console.log(`  Total de registros: ${counts.total_agentes}`);
    console.log(`  Agentes inmobiliarios: ${counts.agentes_activos}`);
    console.log(`  Solo administradores: ${counts.solo_administradores}`);
    console.log(`  Activos en sistema: ${counts.activos_en_sistema}`);
    console.log(`  Inactivos en sistema: ${counts.inactivos_en_sistema}`);
    console.log('');
    
    // 3. Mostrar TODOS los agentes con TODOS sus campos
    console.log('👥 AGENTES INMOBILIARIOS COMPLETOS:');
    const agentsQuery = `
      SELECT 
        id,
        firebase_uid,
        nombre,
        email,
        telefono,
        cedula,
        especialidad,
        comision_ventas,
        comision_arriendos,
        activo,
        foto_perfil,
        biografia,
        fecha_ingreso,
        fecha_creacion,
        fecha_actualizacion,
        es_agente,
        creado_por
      FROM administradores 
      WHERE es_agente = true
      ORDER BY fecha_creacion DESC
    `;
    
    const agentsResult = await client.query(agentsQuery);
    
    if (agentsResult.rows.length === 0) {
      console.log('❌ No se encontraron agentes inmobiliarios');
      console.log('💡 Posibles causas:');
      console.log('   - La tabla no existe');
      console.log('   - No hay registros con es_agente = true');
      console.log('   - Necesitas ejecutar la migración de agentes');
      
      // Verificar si la tabla existe
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'administradores'
        )
      `;
      const tableExists = await client.query(tableExistsQuery);
      
      if (!tableExists.rows[0].exists) {
        console.log('\n🔍 VERIFICACIÓN ADICIONAL:');
        console.log('  ❌ La tabla "administradores" NO existe');
        console.log('  💡 Necesitas ejecutar la migración de agentes primero');
      } else {
        console.log('\n🔍 VERIFICACIÓN ADICIONAL:');
        console.log('  ✅ La tabla "administradores" existe');
        console.log('  💡 Pero no hay registros con es_agente = true');
        
        // Verificar si hay registros en la tabla
        const totalRecordsQuery = `SELECT COUNT(*) as total FROM administradores`;
        const totalRecords = await client.query(totalRecordsQuery);
        console.log(`  📊 Total de registros en la tabla: ${totalRecords.rows[0].total}`);
        
        // Mostrar algunos registros de ejemplo
        const sampleQuery = `SELECT * FROM administradores LIMIT 3`;
        const sampleResult = await client.query(sampleQuery);
        
        if (sampleResult.rows.length > 0) {
          console.log('\n📋 MUESTRA DE REGISTROS EXISTENTES:');
          sampleResult.rows.forEach((record, index) => {
            console.log(`\n  --- REGISTRO ${index + 1} ---`);
            Object.keys(record).forEach(key => {
              const value = record[key];
              let displayValue = value;
              
              if (key === 'activo' || key === 'es_agente') {
                displayValue = value ? 'Sí' : 'No';
              } else if (value === null || value === undefined || value === '') {
                displayValue = 'No especificado';
              }
              
              console.log(`    ${key}: ${displayValue}`);
            });
          });
        }
      }
    } else {
      agentsResult.rows.forEach((agent, index) => {
        console.log(`\n--- AGENTE ${index + 1} ---`);
        console.log(`ID: ${agent.id}`);
        console.log(`Firebase UID: ${agent.firebase_uid}`);
        console.log(`Nombre: ${agent.nombre}`);
        console.log(`Email: ${agent.email}`);
        console.log(`Teléfono: ${agent.telefono || 'No especificado'}`);
        console.log(`Cédula: ${agent.cedula || 'No especificada'}`);
        console.log(`Especialidad: ${agent.especialidad}`);
        console.log(`Comisión Ventas: ${agent.comision_ventas}%`);
        console.log(`Comisión Arriendos: ${agent.comision_arriendos}%`);
        console.log(`Activo: ${agent.activo ? 'Sí' : 'No'}`);
        console.log(`Foto Perfil: ${agent.foto_perfil || 'No especificada'}`);
        console.log(`Biografía: ${agent.biografia || 'No especificada'}`);
        console.log(`Fecha Ingreso: ${agent.fecha_ingreso || 'No especificada'}`);
        console.log(`Fecha Creación: ${agent.fecha_creacion}`);
        console.log(`Fecha Actualización: ${agent.fecha_actualizacion}`);
        console.log(`Es Agente: ${agent.es_agente ? 'Sí' : 'No'}`);
        console.log(`Creado por: ${agent.creado_por || 'No especificado'}`);
      });
    }
    
    // 4. Análisis de datos inusuales
    console.log('\n🔍 ANÁLISIS DE DATOS INUSUALES:');
    
    const noCedulaQuery = `
      SELECT COUNT(*) as count, 'Sin cédula' as tipo
      FROM administradores 
      WHERE es_agente = true AND (cedula IS NULL OR cedula = '')
      UNION ALL
      SELECT COUNT(*) as count, 'Sin teléfono' as tipo
      FROM administradores 
      WHERE es_agente = true AND (telefono IS NULL OR telefono = '')
      UNION ALL
      SELECT COUNT(*) as count, 'Sin biografía' as tipo
      FROM administradores 
      WHERE es_agente = true AND (biografia IS NULL OR biografia = '')
      UNION ALL
      SELECT COUNT(*) as count, 'Sin foto' as tipo
      FROM administradores 
      WHERE es_agente = true AND (foto_perfil IS NULL OR foto_perfil = '')
    `;
    
    try {
      const unusualResult = await client.query(noCedulaQuery);
      unusualResult.rows.forEach(row => {
        console.log(`  ${row.tipo}: ${row.count} agentes`);
      });
    } catch (error) {
      console.log('  ⚠️  No se pudo analizar datos inusuales (posiblemente la tabla no tiene las columnas necesarias)');
    }
    
    // 5. Análisis de comisiones
    console.log('\n💰 ANÁLISIS DE COMISIONES:');
    try {
      const commissionQuery = `
        SELECT 
          especialidad,
          COUNT(*) as cantidad,
          AVG(comision_ventas) as avg_comision_ventas,
          AVG(comision_arriendos) as avg_comision_arriendos,
          MIN(comision_ventas) as min_comision_ventas,
          MAX(comision_ventas) as max_comision_ventas,
          MIN(comision_arriendos) as min_comision_arriendos,
          MAX(comision_arriendos) as max_comision_arriendos
        FROM administradores 
        WHERE es_agente = true
        GROUP BY especialidad
      `;
      
      const commissionResult = await client.query(commissionQuery);
      commissionResult.rows.forEach(row => {
        console.log(`\n  Especialidad: ${row.especialidad}`);
        console.log(`    Cantidad: ${row.cantidad}`);
        console.log(`    Comisión Ventas - Promedio: ${parseFloat(row.avg_comision_ventas).toFixed(2)}%, Min: ${row.min_comision_ventas}%, Max: ${row.max_comision_ventas}%`);
        console.log(`    Comisión Arriendos - Promedio: ${parseFloat(row.avg_comision_arriendos).toFixed(2)}%, Min: ${row.min_comision_arriendos}%, Max: ${row.max_comision_arriendos}%`);
      });
    } catch (error) {
      console.log('  ⚠️  No se pudo analizar comisiones (posiblemente la tabla no tiene las columnas necesarias)');
    }
    
    // 6. Verificar duplicados
    console.log('\n🔍 VERIFICANDO DUPLICADOS:');
    try {
      const duplicateQuery = `
        SELECT 
          email, COUNT(*) as count
        FROM administradores 
        WHERE es_agente = true
        GROUP BY email 
        HAVING COUNT(*) > 1
      `;
      
      const duplicateResult = await client.query(duplicateQuery);
      if (duplicateResult.rows.length > 0) {
        console.log('  ❌ Emails duplicados encontrados:');
        duplicateResult.rows.forEach(row => {
          console.log(`      ${row.email}: ${row.count} veces`);
        });
      } else {
        console.log('  ✅ No hay emails duplicados');
      }
    } catch (error) {
      console.log('  ⚠️  No se pudo verificar duplicados');
    }
    
    // 7. Resumen final
    console.log('\n📋 RESUMEN FINAL:');
    console.log(`Total de agentes analizados: ${agentsResult.rows.length}`);
    console.log(`Agentes activos: ${counts.activos_en_sistema}`);
    console.log(`Agentes inactivos: ${counts.inactivos_en_sistema}`);
    
    if (agentsResult.rows.length > 0) {
      const avgComisionVentas = agentsResult.rows.reduce((sum, agent) => sum + parseFloat(agent.comision_ventas || 0), 0) / agentsResult.rows.length;
      const avgComisionArriendos = agentsResult.rows.reduce((sum, agent) => sum + parseFloat(agent.comision_arriendos || 0), 0) / agentsResult.rows.length;
      
      console.log(`Comisión promedio ventas: ${avgComisionVentas.toFixed(2)}%`);
      console.log(`Comisión promedio arriendos: ${avgComisionArriendos.toFixed(2)}%`);
    }
    
  } catch (error) {
    console.error('❌ Error al analizar agentes:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Verificar si es un error de conexión
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solución: Verifica que la base de datos esté ejecutándose');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Solución: La tabla administradores no existe. Ejecuta la migración primero.');
    } else if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n💡 Solución: Faltan columnas. Ejecuta la migración de agentes.');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Solución: Credenciales incorrectas. Verifica usuario y contraseña.');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Solución: Timeout de conexión. Verifica la conectividad a internet.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
if (require.main === module) {
  showAllAgentsHeroku()
    .then(() => {
      console.log('\n✅ Análisis completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { showAllAgentsHeroku };
