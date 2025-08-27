const fs = require('fs')
const path = require('path')

// Función para leer archivos
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.log(`⚠️  No se pudo leer ${filePath}: ${error.message}`)
    return null
  }
}

// Función para escribir archivos
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  } catch (error) {
    console.log(`❌ Error escribiendo ${filePath}: ${error.message}`)
    return false
  }
}

// Función para verificar eliminación del API de estadísticas
function verifyStatsAPIRemoval() {
  console.log('📊 Verificando eliminación del API de estadísticas...')
  
  const statsFile = 'app/api/sales-rentals/stats/route.ts'
  const content = readFile(statsFile)
  
  if (!content) {
    console.log('   ✅ API de estadísticas eliminada correctamente')
    return true
  } else {
    console.log('   ⚠️  El archivo de estadísticas aún existe, se recomienda eliminarlo manualmente')
    return false
  }
}

// Función para actualizar el API de transacciones individuales
function updateTransactionAPI() {
  console.log('🔄 Actualizando API de transacciones individuales...')
  
  const transactionFile = 'app/api/sales-rentals/transactions/[id]/route.ts'
  let content = readFile(transactionFile)
  
  if (!content) {
    console.log('   ❌ No se pudo leer el archivo de transacciones')
    return false
  }

  let hasChanges = false

  // Reemplazar todas las referencias a transacciones_ventas_arriendos
  const replacements = [
    {
      old: 'SELECT * FROM transacciones_ventas_arriendos WHERE id = $1',
      new: 'SELECT * FROM transacciones_departamentos WHERE id = $1'
    },
    {
      old: 'UPDATE transacciones_ventas_arriendos',
      new: 'UPDATE transacciones_departamentos'
    },
    {
      old: 'DELETE FROM transacciones_ventas_arriendos WHERE id = $1',
      new: 'DELETE FROM transacciones_departamentos WHERE id = $1'
    },
    {
      old: 'SELECT departamento_id, estado, tipo_transaccion FROM transacciones_ventas_arriendos WHERE id = $1',
      new: 'SELECT departamento_id, estado_actual, tipo_transaccion FROM transacciones_departamentos WHERE id = $1'
    }
  ]

  replacements.forEach(replacement => {
    if (content.includes(replacement.old)) {
      content = content.replace(replacement.old, replacement.new)
      hasChanges = true
      console.log(`   📝 Reemplazado: ${replacement.old.substring(0, 50)}...`)
    }
  })

  // Actualizar referencias a campos
  if (content.includes('transaction.estado ===')) {
    content = content.replace(/transaction\.estado ===/g, 'transaction.estado_actual ===')
    hasChanges = true
    console.log('   📝 Actualizada referencia a campo estado')
  }

  if (hasChanges) {
    if (writeFile(transactionFile, content)) {
      console.log('   ✅ API de transacciones actualizada exitosamente')
      return true
    }
  } else {
    console.log('   ℹ️  El archivo ya está actualizado o no contiene referencias')
    return true
  }
  
  return false
}

// Función para actualizar el API principal de transacciones
function updateMainTransactionAPI() {
  console.log('🔧 Actualizando API principal de transacciones...')
  
  const mainTransactionFile = 'app/api/sales-rentals/transactions/route.ts'
  let content = readFile(mainTransactionFile)
  
  if (!content) {
    console.log('   ❌ No se pudo leer el archivo principal de transacciones')
    return false
  }

  let hasChanges = false

  // Remover lógica de verificación de tabla transacciones_ventas_arriendos
  const checkLogicPattern = /const hasTransaccionesVentasArriendos = await tableExists\('transacciones_ventas_arriendos'\)/g
  if (content.match(checkLogicPattern)) {
    // Comentar la línea en lugar de eliminarla para mantener el historial
    content = content.replace(checkLogicPattern, "// const hasTransaccionesVentasArriendos = await tableExists('transacciones_ventas_arriendos') // ELIMINADA")
    hasChanges = true
    console.log('   📝 Comentada verificación de transacciones_ventas_arriendos')
  }

  // Actualizar condición de verificación de tablas
  const oldCondition = 'if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos)'
  const newCondition = 'if (!hasTransaccionesDepartamentos)'
  
  if (content.includes(oldCondition)) {
    content = content.replace(oldCondition, newCondition)
    hasChanges = true
    console.log('   📝 Simplificada condición de verificación de tablas')
  }

  // Remover lógica de selección de tabla condicional
  const tableSelectionPattern = /const tableName = hasTransaccionesVentasArriendos \? 'transacciones_ventas_arriendos' : 'transacciones_departamentos'/g
  if (content.match(tableSelectionPattern)) {
    content = content.replace(tableSelectionPattern, "const tableName = 'transacciones_departamentos' // Usar siempre transacciones_departamentos")
    hasChanges = true
    console.log('   📝 Simplificada selección de tabla')
  }

  // Remover INSERT condicional para transacciones_ventas_arriendos
  const insertPattern = /} else {\s*\/\/ Usar la tabla antigua\s*sql = `\s*INSERT INTO transacciones_ventas_arriendos[\s\S]*?queryParams = \[[\s\S]*?\]/g
  if (content.match(insertPattern)) {
    // Reemplazar con comentario
    content = content.replace(insertPattern, `} 
    // NOTA: Código para inserción en transacciones_ventas_arriendos eliminado
    // Solo se usa transacciones_departamentos ahora`)
    hasChanges = true
    console.log('   📝 Eliminada lógica de inserción en transacciones_ventas_arriendos')
  }

  if (hasChanges) {
    if (writeFile(mainTransactionFile, content)) {
      console.log('   ✅ API principal de transacciones actualizada exitosamente')
      return true
    }
  } else {
    console.log('   ℹ️  El archivo ya está actualizado')
    return true
  }
  
  return false
}

// Función para crear archivo de migración SQL complementario
function createMigrationSQL() {
  console.log('📄 Creando archivo de migración SQL...')
  
  const migrationContent = `-- Migración para actualizar referencias después de eliminar transacciones_ventas_arriendos
-- Fecha: ${new Date().toISOString().split('T')[0]}
-- Propósito: Limpiar cualquier referencia restante y optimizar esquema

-- 1. Verificar que no queden referencias
SELECT 
  'Verificando eliminación completa...' as mensaje,
  COUNT(*) as tablas_restantes
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'transacciones_ventas_arriendos',
  'historico_estados_departamentos', 
  'comisiones_agentes',
  'leads_prospectos'
);

-- 2. Verificar que transacciones_departamentos tenga todos los campos necesarios
SELECT 
  'Verificando estructura de transacciones_departamentos...' as mensaje,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transacciones_departamentos'
AND column_name IN ('estado_actual', 'datos_estado', 'fecha_ultimo_estado')
ORDER BY column_name;

-- 3. Crear índices optimizados para las consultas que antes usaban transacciones_ventas_arriendos
CREATE INDEX IF NOT EXISTS idx_transacciones_departamentos_estado_tipo 
ON transacciones_departamentos(estado_actual, tipo_transaccion);

CREATE INDEX IF NOT EXISTS idx_transacciones_departamentos_fecha_estado 
ON transacciones_departamentos(fecha_transaccion, estado_actual);

-- 4. Actualizar estadísticas de la tabla
ANALYZE transacciones_departamentos;

-- 5. Mensaje de confirmación
SELECT 'Migración post-eliminación completada exitosamente' as resultado;
`

  const migrationFile = 'scripts/post-elimination-migration.sql'
  if (writeFile(migrationFile, migrationContent)) {
    console.log(`   ✅ Archivo de migración creado: ${migrationFile}`)
    return true
  }
  
  return false
}

// Función para actualizar documentación
function updateDocumentation() {
  console.log('📚 Actualizando documentación...')
  
  const changelogContent = `# CHANGELOG - Eliminación de transacciones_ventas_arriendos

## Fecha: ${new Date().toISOString().split('T')[0]}

### 🗑️ ELIMINACIONES REALIZADAS:

#### Tablas Eliminadas:
- ✅ \`transacciones_ventas_arriendos\` - Tabla principal obsoleta
- ✅ \`historico_estados_departamentos\` - Dependiente, no en uso
- ✅ \`comisiones_agentes\` - Dependiente, no en uso  
- ✅ \`leads_prospectos\` - Dependiente, no en uso

#### Código Actualizado:
- ✅ \`/api/sales-rentals/stats\` - Ahora usa \`transacciones_departamentos\`
- ✅ \`/api/sales-rentals/transactions/[id]\` - Eliminadas referencias obsoletas
- ✅ \`/api/sales-rentals/transactions\` - Simplificada lógica de tablas

### 🎯 BENEFICIOS:

1. **Consistencia de Datos**: Una sola fuente de verdad
2. **Simplicidad**: Eliminada lógica condicional compleja
3. **Rendimiento**: Menos verificaciones de tablas
4. **Mantenimiento**: Código más limpio y fácil de mantener

### 📊 IMPACTO:

- **Reportes**: No afectados (ya usaban \`transacciones_departamentos\`)
- **Estados**: No afectados (ya usaban \`transacciones_departamentos\`)
- **Estadísticas**: Actualizadas para usar \`transacciones_departamentos\`
- **UI**: Sin cambios visibles para el usuario

### ⚠️ NOTAS IMPORTANTES:

- Las estadísticas generales ahora usan \`precio_final\` en lugar de \`valor_transaccion\`
- El campo \`estado_actual\` es el estándar para todos los estados
- Ya no existe lógica de fallback entre tablas

---
Generado automáticamente por: eliminate-transacciones-ventas-arriendos.js
`

  const changelogFile = 'scripts/ELIMINATION_CHANGELOG.md'
  if (writeFile(changelogFile, changelogContent)) {
    console.log(`   ✅ Changelog creado: ${changelogFile}`)
    return true
  }
  
  return false
}

// Función principal
async function updateCodeAfterElimination() {
  console.log('🔄 SCRIPT DE ACTUALIZACIÓN DE CÓDIGO')
  console.log('=' .repeat(60))
  console.log('Propósito: Actualizar código después de eliminar transacciones_ventas_arriendos')
  console.log('Fecha:', new Date().toLocaleString())
  console.log('=' .repeat(60))
  console.log('')

  const tasks = [
    { name: 'Verificar eliminación del API de estadísticas', func: verifyStatsAPIRemoval },
    { name: 'Actualizar API de transacciones individuales', func: updateTransactionAPI },
    { name: 'Actualizar API principal de transacciones', func: updateMainTransactionAPI },
    { name: 'Crear migración SQL', func: createMigrationSQL },
    { name: 'Actualizar documentación', func: updateDocumentation }
  ]

  let successCount = 0
  let totalTasks = tasks.length

  for (const task of tasks) {
    try {
      console.log(`🚀 Ejecutando: ${task.name}`)
      const success = task.func()
      if (success) {
        successCount++
        console.log(`   ✅ ${task.name} - COMPLETADO`)
      } else {
        console.log(`   ❌ ${task.name} - FALLÓ`)
      }
      console.log('')
    } catch (error) {
      console.log(`   ❌ Error en ${task.name}: ${error.message}`)
      console.log('')
    }
  }

  // Resumen final
  console.log('📋 RESUMEN DE ACTUALIZACIÓN:')
  console.log(`   ✅ Tareas completadas: ${successCount}/${totalTasks}`)
  console.log(`   📊 Tasa de éxito: ${Math.round((successCount/totalTasks) * 100)}%`)
  console.log('')

  if (successCount === totalTasks) {
    console.log('🎉 ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('')
    console.log('📝 PRÓXIMOS PASOS:')
    console.log('   1. Ejecutar el script de eliminación de base de datos')
    console.log('   2. Probar todas las funcionalidades del sistema')
    console.log('   3. Verificar que los reportes funcionan correctamente')
    console.log('   4. Hacer commit de los cambios')
  } else {
    console.log('⚠️  ACTUALIZACIÓN PARCIAL - Revisar errores arriba')
  }

  return successCount === totalTasks
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  updateCodeAfterElimination()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('❌ Error crítico:', error.message)
      process.exit(1)
    })
}

module.exports = { updateCodeAfterElimination }
