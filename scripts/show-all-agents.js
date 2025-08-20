const { Pool } = require('pg');

// Configuración de la base de datos - credenciales de Heroku
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

async function showAllAgents() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ANALIZANDO TODOS LOS AGENTES INMOBILIARIOS...\n');
    
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
    
    // Agentes sin cédula
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
    
    const unusualResult = await client.query(noCedulaQuery);
    unusualResult.rows.forEach(row => {
      console.log(`  ${row.tipo}: ${row.count} agentes`);
    });
    
    // 5. Análisis de comisiones
    console.log('\n💰 ANÁLISIS DE COMISIONES:');
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
    
    // 6. Agentes con datos sospechosos
    console.log('\n⚠️  AGENTES CON DATOS SOSPECHOSOS:');
    
    // Agentes con comisiones muy altas o muy bajas
    const suspiciousQuery = `
      SELECT 
        id, nombre, email, especialidad, comision_ventas, comision_arriendos
      FROM administradores 
      WHERE es_agente = true AND (
        comision_ventas > 10 OR comision_ventas < 1 OR
        comision_arriendos > 20 OR comision_arriendos < 5
      )
      ORDER BY comision_ventas DESC, comision_arriendos DESC
    `;
    
    const suspiciousResult = await client.query(suspiciousQuery);
    if (suspiciousResult.rows.length > 0) {
      suspiciousResult.rows.forEach(agent => {
        console.log(`  ⚠️  ${agent.nombre} (${agent.email})`);
        console.log(`      Comisión Ventas: ${agent.comision_ventas}% (${agent.comision_ventas > 10 ? 'MUY ALTA' : agent.comision_ventas < 1 ? 'MUY BAJA' : 'NORMAL'})`);
        console.log(`      Comisión Arriendos: ${agent.comision_arriendos}% (${agent.comision_arriendos > 20 ? 'MUY ALTA' : agent.comision_arriendos < 5 ? 'MUY BAJA' : 'NORMAL'})`);
      });
    } else {
      console.log('  ✅ Todas las comisiones están en rangos normales');
    }
    
    // 7. Agentes duplicados o con emails similares
    console.log('\n🔍 VERIFICANDO DUPLICADOS:');
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
    
    // 8. Resumen final
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
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
if (require.main === module) {
  showAllAgents()
    .then(() => {
      console.log('\n✅ Análisis completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { showAllAgents };
