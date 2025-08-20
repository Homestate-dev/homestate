const https = require('https');
const http = require('http');

// Configuración - ajusta según tu entorno
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  endpoint: '/api/agents'
};

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function showAgentsViaAPI() {
  try {
    console.log('🔍 ANALIZANDO AGENTES INMOBILIARIOS VÍA API...\n');
    console.log(`🌐 Conectando a: ${config.baseUrl}${config.endpoint}\n`);
    
    // 1. Obtener agentes desde la API
    const response = await makeRequest(`${config.baseUrl}${config.endpoint}`);
    
    if (response.status !== 200) {
      console.log(`❌ Error HTTP: ${response.status}`);
      console.log('Respuesta:', response.data);
      return;
    }
    
    if (!response.data.success) {
      console.log('❌ La API devolvió un error:');
      console.log(response.data.error || 'Error desconocido');
      return;
    }
    
    const agents = response.data.data || [];
    
    // 2. Mostrar estadísticas
    console.log('📊 ESTADÍSTICAS GENERALES:');
    console.log(`Total de agentes: ${agents.length}`);
    console.log('');
    
    if (agents.length === 0) {
      console.log('❌ No se encontraron agentes inmobiliarios');
      console.log('💡 Posibles causas:');
      console.log('   - No hay agentes registrados');
      console.log('   - La base de datos no está configurada');
      console.log('   - Necesitas ejecutar la migración de agentes');
      return;
    }
    
    // 3. Mostrar todos los agentes con todos sus campos
    console.log('👥 AGENTES INMOBILIARIOS COMPLETOS:');
    agents.forEach((agent, index) => {
      console.log(`\n--- AGENTE ${index + 1} ---`);
      
      // Mostrar todos los campos disponibles
      Object.keys(agent).forEach(key => {
        const value = agent[key];
        let displayValue = value;
        
        // Formatear valores especiales
        if (key === 'activo' || key === 'es_agente') {
          displayValue = value ? 'Sí' : 'No';
        } else if (key === 'fecha_creacion' || key === 'fecha_actualizacion' || key === 'fecha_ingreso') {
          displayValue = value ? new Date(value).toLocaleString('es-ES') : 'No especificada';
        } else if (value === null || value === undefined || value === '') {
          displayValue = 'No especificado';
        }
        
        console.log(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${displayValue}`);
      });
    });
    
    // 4. Análisis de datos inusuales
    console.log('\n🔍 ANÁLISIS DE DATOS INUSUALES:');
    
    const agentsWithoutCedula = agents.filter(a => !a.cedula || a.cedula === '');
    const agentsWithoutPhone = agents.filter(a => !a.telefono || a.telefono === '');
    const agentsWithoutBio = agents.filter(a => !a.biografia || a.biografia === '');
    const agentsWithoutPhoto = agents.filter(a => !a.foto_perfil || a.foto_perfil === '');
    
    console.log(`  Sin cédula: ${agentsWithoutCedula.length} agentes`);
    console.log(`  Sin teléfono: ${agentsWithoutPhone.length} agentes`);
    console.log(`  Sin biografía: ${agentsWithoutBio.length} agentes`);
    console.log(`  Sin foto: ${agentsWithoutPhoto.length} agentes`);
    
    // 5. Análisis de comisiones
    console.log('\n💰 ANÁLISIS DE COMISIONES:');
    
    const specializations = {};
    agents.forEach(agent => {
      const spec = agent.especialidad || 'No especificada';
      if (!specializations[spec]) {
        specializations[spec] = {
          count: 0,
          comisionVentas: [],
          comisionArriendos: []
        };
      }
      
      specializations[spec].count++;
      if (agent.comision_ventas) specializations[spec].comisionVentas.push(agent.comision_ventas);
      if (agent.comision_arriendos) specializations[spec].comisionArriendos.push(agent.comision_arriendos);
    });
    
    Object.entries(specializations).forEach(([spec, data]) => {
      console.log(`\n  Especialidad: ${spec}`);
      console.log(`    Cantidad: ${data.count}`);
      
      if (data.comisionVentas.length > 0) {
        const avg = data.comisionVentas.reduce((a, b) => a + b, 0) / data.comisionVentas.length;
        const min = Math.min(...data.comisionVentas);
        const max = Math.max(...data.comisionVentas);
        console.log(`    Comisión Ventas - Promedio: ${avg.toFixed(2)}%, Min: ${min}%, Max: ${max}%`);
      }
      
      if (data.comisionArriendos.length > 0) {
        const avg = data.comisionArriendos.reduce((a, b) => a + b, 0) / data.comisionArriendos.length;
        const min = Math.min(...data.comisionArriendos);
        const max = Math.max(...data.comisionArriendos);
        console.log(`    Comisión Arriendos - Promedio: ${avg.toFixed(2)}%, Min: ${min}%, Max: ${max}%`);
      }
    });
    
    // 6. Agentes con datos sospechosos
    console.log('\n⚠️  AGENTES CON DATOS SOSPECHOSOS:');
    
    const suspiciousAgents = agents.filter(agent => {
      const comisionVentas = agent.comision_ventas || 0;
      const comisionArriendos = agent.comision_arriendos || 0;
      
      return comisionVentas > 10 || comisionVentas < 1 || 
             comisionArriendos > 20 || comisionArriendos < 5;
    });
    
    if (suspiciousAgents.length > 0) {
      suspiciousAgents.forEach(agent => {
        console.log(`  ⚠️  ${agent.nombre} (${agent.email})`);
        if (agent.comision_ventas) {
          const status = agent.comision_ventas > 10 ? 'MUY ALTA' : 
                        agent.comision_ventas < 1 ? 'MUY BAJA' : 'NORMAL';
          console.log(`      Comisión Ventas: ${agent.comision_ventas}% (${status})`);
        }
        if (agent.comision_arriendos) {
          const status = agent.comision_arriendos > 20 ? 'MUY ALTA' : 
                        agent.comision_arriendos < 5 ? 'MUY BAJA' : 'NORMAL';
          console.log(`      Comisión Arriendos: ${agent.comision_arriendos}% (${status})`);
        }
      });
    } else {
      console.log('  ✅ Todas las comisiones están en rangos normales');
    }
    
    // 7. Verificar duplicados
    console.log('\n🔍 VERIFICANDO DUPLICADOS:');
    
    const emailCounts = {};
    agents.forEach(agent => {
      const email = agent.email?.toLowerCase();
      if (email) {
        emailCounts[email] = (emailCounts[email] || 0) + 1;
      }
    });
    
    const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('  ❌ Emails duplicados encontrados:');
      duplicates.forEach(([email, count]) => {
        console.log(`      ${email}: ${count} veces`);
      });
    } else {
      console.log('  ✅ No hay emails duplicados');
    }
    
    // 8. Resumen final
    console.log('\n📋 RESUMEN FINAL:');
    console.log(`Total de agentes analizados: ${agents.length}`);
    
    const activeAgents = agents.filter(a => a.activo).length;
    const inactiveAgents = agents.filter(a => !a.activo).length;
    console.log(`Agentes activos: ${activeAgents}`);
    console.log(`Agentes inactivos: ${inactiveAgents}`);
    
    if (agents.length > 0) {
      const avgComisionVentas = agents
        .filter(a => a.comision_ventas)
        .reduce((sum, agent) => sum + agent.comision_ventas, 0) / 
        agents.filter(a => a.comision_ventas).length;
      
      const avgComisionArriendos = agents
        .filter(a => a.comision_arriendos)
        .reduce((sum, agent) => sum + agent.comision_arriendos, 0) / 
        agents.filter(a => a.comision_arriendos).length;
      
      if (!isNaN(avgComisionVentas)) {
        console.log(`Comisión promedio ventas: ${avgComisionVentas.toFixed(2)}%`);
      }
      if (!isNaN(avgComisionArriendos)) {
        console.log(`Comisión promedio arriendos: ${avgComisionArriendos.toFixed(2)}%`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al analizar agentes:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solución: Verifica que la aplicación esté ejecutándose en:', config.baseUrl);
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Solución: La API tardó demasiado en responder. Verifica la conexión.');
    } else if (error.message.includes('Request failed')) {
      console.log('\n💡 Solución: No se pudo conectar a la API. Verifica la URL y que el servidor esté activo.');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  showAgentsViaAPI()
    .then(() => {
      console.log('\n✅ Análisis completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { showAgentsViaAPI };
