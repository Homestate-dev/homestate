# Scripts de Eliminación de Transacciones

## 📋 Descripción

Este directorio contiene scripts para eliminar todas las transacciones registradas de la base de datos y sus datos asociados.

## ⚠️ ADVERTENCIA IMPORTANTE

**ESTOS SCRIPTS SON IRREVERSIBLES.** Una vez ejecutados, no se pueden recuperar los datos eliminados.

## 📁 Archivos Disponibles

### 1. Eliminación Completa (Recomendado)

#### `delete-all-transactions.sql`
- **Descripción**: Script SQL que elimina TODAS las transacciones y datos asociados
- **Elimina**:
  - Todas las transacciones de `transacciones_departamentos`
  - Todas las transacciones de `transacciones_ventas_arriendos`
  - Historial de estados de transacciones
  - Estados de transacciones
  - Comisiones de agentes
  - Leads y prospectos relacionados
  - Histórico de estados de departamentos
- **Resetea**: Todas las secuencias de ID

#### `delete-all-transactions.js`
- **Descripción**: Script Node.js con confirmaciones múltiples
- **Características**:
  - Doble confirmación de seguridad
  - Verificación previa de datos existentes
  - Verificación posterior de eliminación
  - Reporte detallado de resultados
- **Uso**: `node scripts/delete-all-transactions.js`

### 2. Eliminación Simple

#### `delete-transactions-simple.sql`
- **Descripción**: Script SQL que elimina solo las transacciones principales
- **Elimina**:
  - Todas las transacciones de `transacciones_departamentos`
  - Todas las transacciones de `transacciones_ventas_arriendos`
- **Resetea**: Secuencias de ID de transacciones

#### `delete-transactions-simple.js`
- **Descripción**: Script Node.js simple con confirmación
- **Características**:
  - Confirmación única
  - Verificación de datos existentes
  - Reporte de resultados
- **Uso**: `node scripts/delete-transactions-simple.js`

## 🚀 Cómo Usar

### Opción 1: Eliminación Completa (Recomendado)

```bash
# Ejecutar script completo con confirmaciones
node scripts/delete-all-transactions.js
```

**Proceso:**
1. El script mostrará una advertencia detallada
2. Solicitará confirmación escribiendo "ELIMINAR"
3. Solicitará segunda confirmación escribiendo "SI"
4. Ejecutará la eliminación completa
5. Mostrará reporte detallado

### Opción 2: Eliminación Simple

```bash
# Ejecutar script simple
node scripts/delete-transactions-simple.js
```

**Proceso:**
1. El script mostrará una advertencia
2. Solicitará confirmación escribiendo "SI"
3. Ejecutará la eliminación de transacciones principales
4. Mostrará reporte de resultados

### Opción 3: Ejecutar SQL Directamente

```bash
# Para eliminación completa
psql -h [host] -U [user] -d [database] -f scripts/delete-all-transactions.sql

# Para eliminación simple
psql -h [host] -U [user] -d [database] -f scripts/delete-transactions-simple.sql
```

## 📊 Qué Se Elimina

### Eliminación Completa:
- ✅ `transacciones_departamentos` - Todas las transacciones
- ✅ `transacciones_ventas_arriendos` - Todas las transacciones
- ✅ `estados_transaccion` - Estados de transacciones
- ✅ `historial_estados_transaccion` - Historial de cambios
- ✅ `comisiones_agentes` - Comisiones (si existe)
- ✅ `leads_prospectos` - Leads relacionados (si existe)
- ✅ `historico_estados_departamentos` - Histórico (si existe)

### Eliminación Simple:
- ✅ `transacciones_departamentos` - Todas las transacciones
- ✅ `transacciones_ventas_arriendos` - Todas las transacciones

## 🔄 Qué Se Resetea

### Secuencias de ID:
- `transacciones_departamentos_id_seq` → Empieza desde 1
- `transacciones_ventas_arriendos_id_seq` → Empieza desde 1
- `estados_transaccion_id_seq` → Empieza desde 1
- `historial_estados_transaccion_id_seq` → Empieza desde 1
- `comisiones_agentes_id_seq` → Empieza desde 1 (si existe)
- `historico_estados_departamentos_id_seq` → Empieza desde 1 (si existe)
- `leads_prospectos_id_seq` → Empieza desde 1 (si existe)

## ✅ Verificación

Después de ejecutar cualquier script, puedes verificar que la eliminación fue exitosa:

```sql
-- Verificar transacciones restantes
SELECT 
    'transacciones_departamentos' as tabla,
    COUNT(*) as registros
FROM transacciones_departamentos
UNION ALL
SELECT 
    'transacciones_ventas_arriendos' as tabla,
    COUNT(*) as registros
FROM transacciones_ventas_arriendos;

-- Verificar secuencias
SELECT 
    sequence_name,
    last_value
FROM information_schema.sequences 
WHERE sequence_name LIKE '%transacciones%';
```

## 🛡️ Medidas de Seguridad

1. **Confirmaciones Múltiples**: Los scripts requieren confirmación explícita
2. **Verificación Previa**: Muestra cuántos registros se van a eliminar
3. **Verificación Posterior**: Confirma que la eliminación fue exitosa
4. **Reporte Detallado**: Muestra resultados completos
5. **Manejo de Errores**: Captura y reporta errores detalladamente

## 🔧 Próximos Pasos Después de la Eliminación

1. **Verificar el Sistema**: Probar que todo funciona correctamente
2. **Crear Transacciones de Prueba**: Verificar que se pueden crear nuevas transacciones
3. **Verificar Estadísticas**: Confirmar que las estadísticas se muestran correctamente
4. **Probar Estados**: Verificar que el sistema de estados funciona

## 📞 Soporte

Si tienes problemas con estos scripts:

1. Verifica la conexión a la base de datos
2. Asegúrate de tener permisos de escritura
3. Revisa los logs de error detallados
4. Contacta al administrador del sistema

---

**⚠️ RECUERDA: Estos scripts son irreversibles. Úsalos con precaución.** 