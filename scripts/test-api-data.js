// Script para probar la API y verificar datos
// Ejecutar con: node scripts/test-api-data.js

const { getBuildingWithDepartmentsByPermalink } = require('../lib/database.ts')

async function testBuildingData() {
  console.log('🔍 Testing getBuildingWithDepartmentsByPermalink...')
  
  try {
    const permalink = 'edificio-mondrian'
    console.log(`\n📍 Testing permalink: ${permalink}`)
    
    const data = await getBuildingWithDepartmentsByPermalink(permalink)
    
    if (!data) {
      console.error('❌ No data returned!')
      return
    }
    
    console.log('\n✅ Data structure analysis:')
    console.log('Building:', {
      id: data.building?.id,
      nombre: data.building?.nombre,
      direccion: data.building?.direccion,
      permalink: data.building?.permalink,
      url_imagen_principal: data.building?.url_imagen_principal?.substring(0, 50) + '...',
      imagenes_secundarias_count: data.building?.imagenes_secundarias?.length || 0,
      areas_comunales_count: data.building?.areas_comunales?.length || 0
    })
    
    console.log('\nDepartments:', {
      count: data.departments?.length || 0,
      sample_department: data.departments?.[0] ? {
        id: data.departments[0].id,
        nombre: data.departments[0].nombre,
        numero: data.departments[0].numero,
        piso: data.departments[0].piso,
        area: data.departments[0].area,
        imagenes_count: data.departments[0].imagenes?.length || 0
      } : 'No departments'
    })
    
    // Validar tipos
    console.log('\n🔍 Type validation:')
    console.log('building is object:', typeof data.building === 'object')
    console.log('building.nombre is string:', typeof data.building?.nombre === 'string')
    console.log('departments is array:', Array.isArray(data.departments))
    console.log('imagenes_secundarias is array:', Array.isArray(data.building?.imagenes_secundarias))
    
    // Buscar posibles problemas
    console.log('\n⚠️ Potential issues:')
    
    if (!data.building?.nombre) {
      console.log('- Missing building name')
    }
    
    if (!Array.isArray(data.building?.imagenes_secundarias)) {
      console.log('- imagenes_secundarias is not an array:', typeof data.building?.imagenes_secundarias)
    }
    
    if (!Array.isArray(data.departments)) {
      console.log('- departments is not an array:', typeof data.departments)
    }
    
    // Validar estructura JSON
    console.log('\n🧪 JSON structure test:')
    try {
      const serialized = JSON.stringify(data)
      const parsed = JSON.parse(serialized)
      console.log('✅ Data can be safely serialized/deserialized')
      console.log('Serialized size:', (serialized.length / 1024).toFixed(2), 'KB')
    } catch (jsonError) {
      console.error('❌ JSON serialization error:', jsonError.message)
    }
    
  } catch (error) {
    console.error('❌ Error testing building data:', error)
    console.error('Stack:', error.stack)
  }
}

// Ejecutar test
testBuildingData().then(() => {
  console.log('\n✅ Test completed')
  process.exit(0)
}).catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
}) 