# Sistema de Comisiones - Homestate

## 📋 Descripción

Este sistema implementa un nuevo modelo de comisiones diferenciado por tipo de transacción (Venta/Arriendo) con distribución automática entre Homestate, Bienes Raíces y Administración del Edificio.

## 🔄 Cambios Implementados

### 🔹 Transacciones tipo "Venta"
- **Comisión**: Se mantiene el campo porcentual (ej: 3%)
- **Cálculo**: `valor_comision = valor_transaccion * (comision / 100)`
- **Distribución**: Se aplican los porcentajes sobre el valor de comisión

### 🔹 Transacciones tipo "Arriendo"
- **Comisión**: Nuevo campo de valor directo (ej: $2,500,000)
- **Cálculo**: Se usa directamente el valor ingresado
- **Distribución**: Se aplican los porcentajes sobre el valor de comisión

### 🔹 Distribución de Comisiones
Para ambos tipos de transacción:
- **Homestate**: Porcentaje configurable (por defecto 60%)
- **Bienes Raíces**: Porcentaje configurable (por defecto 30%)
- **Administración del Edificio**: Porcentaje configurable (por defecto 10%)

## 🛠️ Instalación

### 1. Ejecutar la migración de la base de datos

```bash
# Instalar dependencias si no están instaladas
npm install pg

# Ejecutar el script de instalación
node install-commission-system.js
```

### 2. Verificar la instalación

El script verificará automáticamente:
- ✅ Conexión a la base de datos
- ✅ Creación de nuevos campos
- ✅ Migración de datos existentes
- ✅ Creación de índices de rendimiento

## 📊 Nuevos Campos en la Base de Datos

### Tabla: `transacciones_departamentos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `comision_porcentaje` | DECIMAL(5,2) | Porcentaje de comisión (para ventas) |
| `comision_valor` | DECIMAL(12,2) | Valor de comisión (para arriendos) |
| `porcentaje_homestate` | DECIMAL(5,2) | % para Homestate |
| `porcentaje_bienes_raices` | DECIMAL(5,2) | % para Bienes Raíces |
| `porcentaje_admin_edificio` | DECIMAL(5,2) | % para Administración |
| `valor_homestate` | DECIMAL(12,2) | Valor calculado para Homestate |
| `valor_bienes_raices` | DECIMAL(12,2) | Valor calculado para Bienes Raíces |
| `valor_admin_edificio` | DECIMAL(12,2) | Valor calculado para Administración |

## 🎯 Funcionalidades Implementadas

### ✅ Validaciones
- Suma de porcentajes no puede exceder 100%
- Campos requeridos según tipo de transacción
- Validación de tipos de datos

### ✅ Cálculos Automáticos
- Comisión total según tipo de transacción
- Distribución automática de valores
- Actualización en tiempo real

### ✅ Interfaz de Usuario
- Campos dinámicos según tipo de transacción
- Alertas de validación en tiempo real
- Valores calculados visibles
- Botón deshabilitado con errores

## 📱 Componentes Modificados

### 1. `TransactionDialog` (`components/transaction-dialog.tsx`)
- ✅ Nuevos campos de comisiones
- ✅ Cálculos automáticos
- ✅ Validaciones en tiempo real
- ✅ Interfaz mejorada

### 2. `SalesRentalsManagement` (`components/sales-rentals-management.tsx`)
- ✅ Integración con nuevo sistema
- ✅ Campos dinámicos
- ✅ Cálculos y validaciones
- ✅ Compatibilidad con sistema existente

### 3. `Database Functions` (`lib/database.ts`)
- ✅ Función `createTransaction` actualizada
- ✅ Soporte para nuevos campos
- ✅ Cálculos automáticos en backend

### 4. `API Endpoint` (`app/api/transactions/route.ts`)
- ✅ Validaciones mejoradas
- ✅ Soporte para nuevos campos
- ✅ Manejo de errores

## 🔧 Uso del Sistema

### Para Ventas:
1. Seleccionar tipo "Venta"
2. Ingresar valor de transacción
3. Configurar porcentaje de comisión (ej: 3%)
4. Ajustar porcentajes de distribución
5. Los valores se calculan automáticamente

### Para Arriendos:
1. Seleccionar tipo "Arriendo"
2. Ingresar valor de transacción
3. El campo "Comisión (Valor)" se pre-llena automáticamente
4. Ajustar el valor de comisión si es necesario
5. Configurar porcentajes de distribución

## ⚠️ Validaciones

### Porcentajes de Distribución
- La suma debe ser ≤ 100%
- Se muestra alerta en tiempo real
- Botón de guardar se deshabilita con errores

### Campos Requeridos
- Tipo de transacción
- Valor de transacción
- Agente/Administrador
- Cliente
- Porcentajes de distribución

## 🚀 Características Técnicas

### Rendimiento
- ✅ Índices optimizados en base de datos
- ✅ Cálculos en tiempo real
- ✅ Validaciones eficientes

### Compatibilidad
- ✅ Datos existentes migrados automáticamente
- ✅ Sistema existente no afectado
- ✅ Migración reversible

### Seguridad
- ✅ Validaciones en frontend y backend
- ✅ Manejo de errores robusto
- ✅ Tipos de datos seguros

## 📈 Monitoreo

### Logs de Instalación
El script de instalación genera logs detallados:
- Conexión a base de datos
- Ejecución de migración
- Verificación de campos
- Estadísticas de datos

### Verificación Post-Instalación
```sql
-- Verificar campos creados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transacciones_departamentos' 
AND column_name LIKE '%comision%' OR column_name LIKE '%porcentaje%' OR column_name LIKE '%valor_%';

-- Verificar datos migrados
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN comision_porcentaje IS NOT NULL THEN 1 END) as con_porcentaje,
  COUNT(CASE WHEN comision_valor IS NOT NULL THEN 1 END) as con_valor
FROM transacciones_departamentos;
```

## 🔄 Rollback (Si es necesario)

En caso de necesitar revertir los cambios:

```sql
-- Eliminar campos nuevos
ALTER TABLE transacciones_departamentos 
DROP COLUMN IF EXISTS comision_porcentaje,
DROP COLUMN IF EXISTS comision_valor,
DROP COLUMN IF EXISTS porcentaje_homestate,
DROP COLUMN IF EXISTS porcentaje_bienes_raices,
DROP COLUMN IF EXISTS porcentaje_admin_edificio,
DROP COLUMN IF EXISTS valor_homestate,
DROP COLUMN IF EXISTS valor_bienes_raices,
DROP COLUMN IF EXISTS valor_admin_edificio;

-- Eliminar índices
DROP INDEX IF EXISTS idx_transacciones_tipo;
DROP INDEX IF EXISTS idx_transacciones_fecha;
DROP INDEX IF EXISTS idx_transacciones_agente;
```

## 📞 Soporte

Para problemas o consultas:
1. Revisar logs de instalación
2. Verificar conexión a base de datos
3. Confirmar que todos los archivos están presentes
4. Ejecutar verificaciones SQL manuales

---

**Versión**: 1.0.0  
**Fecha**: $(date)  
**Autor**: Sistema de Comisiones Homestate 