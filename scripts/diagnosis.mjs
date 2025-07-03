import { query } from '../lib/database.ts';

async function diagnosisCompleto() {
  try {
    console.log('=== DIAGNÓSTICO COMPLETO DE BASE DE DATOS ===\n');
    
    // 1. Verificar tablas existentes
    console.log('1. TABLAS EXISTENTES:');
    const tablesResult = await query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('Tablas encontradas:');
    tablesResult.rows.forEach(row => console.log(' -', row.tablename));
    
    // 2. Verificar si existe la tabla de transacciones
    const hasTransacciones = tablesResult.rows.some(row => row.tablename === 'transacciones_ventas_arriendos');
    console.log(`\n2. ¿Existe tabla transacciones_ventas_arriendos? ${hasTransacciones ? 'SÍ' : 'NO'}`);
    
    // 3. Verificar edificios
    console.log('\n3. EDIFICIOS EXISTENTES:');
    const edificiosResult = await query('SELECT id, nombre FROM edificios ORDER BY nombre');
    if (edificiosResult.rows.length > 0) {
      edificiosResult.rows.forEach(e => console.log(`  ID: ${e.id} - ${e.nombre}`));
    } else {
      console.log('  No hay edificios en la base de datos');
    }
    
    // 4. Verificar departamentos del edificio La Aventura específicamente
    console.log('\n4. DEPARTAMENTOS DE "EDIFICIO LA AVENTURA":');
    const deptosAventuraResult = await query(`
      SELECT d.id, d.numero, d.nombre, d.tipo, d.disponible, e.nombre as edificio
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      WHERE e.nombre ILIKE '%aventura%'
      ORDER BY d.numero
    `);
    
    if (deptosAventuraResult.rows.length > 0) {
      deptosAventuraResult.rows.forEach(d => 
        console.log(`  ID: ${d.id} - ${d.numero} (${d.nombre}) - Tipo: ${d.tipo} - Disponible: ${d.disponible}`)
      );
    } else {
      console.log('  No se encontraron departamentos para "Edificio La Aventura"');
    }
    
    // 5. Verificar todos los departamentos disponibles
    console.log('\n5. TODOS LOS DEPARTAMENTOS DISPONIBLES:');
    const todosDeptos = await query(`
      SELECT d.id, d.numero, d.nombre, d.disponible, e.nombre as edificio
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      WHERE d.disponible = true
      ORDER BY e.nombre, d.numero
    `);
    
    if (todosDeptos.rows.length > 0) {
      todosDeptos.rows.forEach(d => 
        console.log(`  ${d.edificio} - ${d.numero} (${d.nombre})`)
      );
    } else {
      console.log('  No hay departamentos disponibles');
    }
    
    // 6. Verificar agentes
    console.log('\n6. AGENTES INMOBILIARIOS:');
    const agentesResult = await query('SELECT id, nombre FROM agentes_inmobiliarios ORDER BY nombre');
    if (agentesResult.rows.length > 0) {
      agentesResult.rows.forEach(a => console.log(`  ID: ${a.id} - ${a.nombre}`));
    } else {
      console.log('  No hay agentes inmobiliarios');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

diagnosisCompleto(); 