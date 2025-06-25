const https = require('https');

console.log('🔧 Probando API después de todas las correcciones...\n');

const options = {
  hostname: 'homestate-17ca5a8016cd.herokuapp.com',
  port: 443,
  path: '/api/buildings',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Estado: ${res.statusCode}`);
  
  res.setEncoding('utf8');
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      if (res.statusCode === 200 && data.success) {
        console.log('✅ ¡API de edificios funcionando correctamente!');
        console.log(`📦 Edificios en la base de datos: ${data.data.length}`);
        console.log('\n🎉 Ya puedes crear edificios desde la interfaz web');
      } else {
        console.log('❌ Error en la API:');
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.log('❌ Error parseando respuesta:');
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

req.end(); 