const { eliminateTransaccionesVentasArriendos } = require('./eliminate-transacciones-ventas-arriendos')
const { updateCodeAfterElimination } = require('./update-code-after-table-elimination')

async function completeEliminationProcess() {
  console.log('🚀 PROCESO COMPLETO DE ELIMINACIÓN')
  console.log('=' .repeat(70))
  console.log('Eliminación completa de transacciones_ventas_arriendos')
  console.log('Fecha:', new Date().toLocaleString())
  console.log('=' .repeat(70))
  console.log('')

  try {
    // Paso 1: Actualizar código primero (por seguridad)
    console.log('📋 PASO 1: ACTUALIZACIÓN DE CÓDIGO')
    console.log('-' .repeat(50))
    console.log('ℹ️  Actualizando archivos de código antes de eliminar tablas...')
    console.log('')
    
    const codeUpdateSuccess = await updateCodeAfterElimination()
    
    if (!codeUpdateSuccess) {
      console.log('❌ ERRO: La actualización de código falló')
      console.log('   No se procederá con la eliminación de tablas por seguridad')
      return false
    }
    
    console.log('✅ Código actualizado exitosamente')
    console.log('')
    console.log('⏳ Esperando 3 segundos antes de continuar...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('')

    // Paso 2: Eliminar tablas de la base de datos
    console.log('📋 PASO 2: ELIMINACIÓN DE BASE DE DATOS')
    console.log('-' .repeat(50))
    console.log('ℹ️  Eliminando tablas y dependencias de la base de datos...')
    console.log('')
    
    await eliminateTransaccionesVentasArriendos()
    
    console.log('✅ Base de datos actualizada exitosamente')
    console.log('')

    // Paso 3: Verificación final
    console.log('📋 PASO 3: VERIFICACIÓN FINAL')
    console.log('-' .repeat(50))
    
    console.log('✅ Proceso de eliminación completado exitosamente')
    console.log('')
    console.log('🎯 RESUMEN DE CAMBIOS REALIZADOS:')
    console.log('')
    console.log('   📂 ARCHIVOS MODIFICADOS:')
    console.log('   • app/api/sales-rentals/stats/route.ts')
    console.log('   • app/api/sales-rentals/transactions/[id]/route.ts')
    console.log('   • app/api/sales-rentals/transactions/route.ts')
    console.log('')
    console.log('   🗑️  TABLAS ELIMINADAS:')
    console.log('   • transacciones_ventas_arriendos')
    console.log('   • historico_estados_departamentos')
    console.log('   • comisiones_agentes')
    console.log('   • leads_prospectos')
    console.log('')
    console.log('   📄 ARCHIVOS GENERADOS:')
    console.log('   • scripts/post-elimination-migration.sql')
    console.log('   • scripts/ELIMINATION_CHANGELOG.md')
    console.log('')
    console.log('🔍 VERIFICACIONES RECOMENDADAS:')
    console.log('   1. Probar la funcionalidad de transacciones')
    console.log('   2. Verificar que los reportes funcionen correctamente')
    console.log('   3. Comprobar que no hay errores en los logs')
    console.log('   4. Realizar backup de la base de datos actualizada')
    console.log('')
    console.log('🎉 ¡ELIMINACIÓN COMPLETADA EXITOSAMENTE!')
    
    return true

  } catch (error) {
    console.error('❌ ERROR CRÍTICO en el proceso de eliminación:')
    console.error('   Mensaje:', error.message)
    console.error('   Stack:', error.stack)
    console.log('')
    console.log('🔄 ACCIONES RECOMENDADAS:')
    console.log('   1. Verificar la conexión a la base de datos')
    console.log('   2. Revisar permisos de escritura de archivos')
    console.log('   3. Ejecutar scripts individuales para debugging')
    console.log('   4. Verificar logs del sistema')
    
    return false
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log('🔧 SCRIPT MAESTRO: Eliminación Completa de transacciones_ventas_arriendos')
  console.log('')
  console.log('📋 USO:')
  console.log('   node scripts/complete-elimination-process.js')
  console.log('')
  console.log('📝 DESCRIPCIÓN:')
  console.log('   Este script realiza la eliminación completa de la tabla')
  console.log('   transacciones_ventas_arriendos y todas sus dependencias.')
  console.log('')
  console.log('🔄 PROCESO:')
  console.log('   1. Actualiza archivos de código para usar transacciones_departamentos')
  console.log('   2. Elimina tablas obsoletas de la base de datos')
  console.log('   3. Genera documentación y archivos de migración')
  console.log('')
  console.log('⚠️  PREREQUISITOS:')
  console.log('   • Variable de entorno DATABASE_URL configurada')
  console.log('   • Permisos de escritura en el directorio del proyecto')
  console.log('   • Backup de la base de datos (recomendado)')
  console.log('')
  console.log('📞 SOPORTE:')
  console.log('   En caso de problemas, ejecutar scripts individuales:')
  console.log('   • node scripts/eliminate-transacciones-ventas-arriendos.js')
  console.log('   • node scripts/update-code-after-table-elimination.js')
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }
  
  console.log('⚠️  ADVERTENCIA: Este script realizará cambios PERMANENTES')
  console.log('   • Eliminará tablas de la base de datos')
  console.log('   • Modificará archivos de código')
  console.log('   • NO se puede deshacer automáticamente')
  console.log('')
  console.log('🔄 Iniciando en 5 segundos... (Ctrl+C para cancelar)')
  
  setTimeout(async () => {
    const success = await completeEliminationProcess()
    process.exit(success ? 0 : 1)
  }, 5000)
}

module.exports = { completeEliminationProcess }
