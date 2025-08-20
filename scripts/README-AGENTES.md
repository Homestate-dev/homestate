# 🔍 Scripts de Análisis de Agentes Inmobiliarios

Este conjunto de scripts te permite analizar todos los agentes inmobiliarios en tu base de datos, mostrando todos sus campos y detectando datos inusuales.

## 📁 Archivos Disponibles

### 1. `show-all-agents.js` - Análisis Directo de Base de Datos
- **Propósito**: Conecta directamente a PostgreSQL para analizar agentes
- **Ventajas**: Acceso completo a todos los campos, análisis detallado
- **Requisitos**: Acceso directo a la base de datos, credenciales de DB

### 2. `show-agents-heroku.js` - Análisis Específico para Heroku
- **Propósito**: Conecta directamente a tu base de datos de Heroku
- **Ventajas**: Credenciales pre-configuradas, análisis específico para tu entorno
- **Requisitos**: Solo Node.js y la dependencia 'pg'

### 2. `show-agents-via-api.js` - Análisis vía API
- **Propósito**: Usa la API de tu aplicación para obtener datos de agentes
- **Ventajas**: No requiere acceso directo a DB, más seguro
- **Requisitos**: Aplicación ejecutándose, API `/api/agents` disponible

### 3. `run-show-agents.ps1` - Ejecutor PowerShell (DB Directa)
- **Propósito**: Script de PowerShell para ejecutar el análisis directo
- **Uso**: `.\scripts\run-show-agents.ps1`

### 4. `run-show-agents-heroku.ps1` - Ejecutor PowerShell para Heroku
- **Propósito**: Script de PowerShell para ejecutar el análisis en Heroku
- **Uso**: `.\scripts\run-show-agents-heroku.ps1`

### 5. `run-show-agents-api.ps1` - Ejecutor PowerShell (vía API)
- **Propósito**: Script de PowerShell para ejecutar el análisis vía API
- **Uso**: `.\scripts\run-show-agents-api.ps1`

## 🚀 Instalación y Configuración

### Opción 1: Análisis Directo de Base de Datos

1. **Instalar dependencias**:
   ```bash
   npm install pg
   ```

2. **Configurar conexión a la base de datos**:
   - Edita `show-all-agents.js` y ajusta la configuración de conexión
   - O configura la variable de entorno `DATABASE_URL`

3. **Ejecutar**:
   ```bash
   node scripts/show-all-agents.js
   ```

### Opción 2: Análisis en Heroku (Recomendado para tu caso)

1. **Instalar dependencias**:
   ```bash
   npm install pg
   ```

2. **Ejecutar con PowerShell**:
   ```powershell
   .\scripts\run-show-agents-heroku.ps1
   ```

3. **O ejecutar directamente**:
   ```bash
   node scripts/show-agents-heroku.js
   ```

### Opción 3: Análisis vía API

1. **Asegúrate de que tu aplicación esté ejecutándose**

2. **Ejecutar con PowerShell**:
   ```powershell
   .\scripts\run-show-agents-api.ps1
   ```

3. **O ejecutar directamente**:
   ```bash
   node scripts/show-agents-via-api.js
   ```

## 📊 Qué Analiza el Script

### 1. **Estructura de la Tabla**
- Muestra todas las columnas disponibles
- Tipos de datos y si son nullables

### 2. **Estadísticas Generales**
- Total de agentes
- Agentes activos vs inactivos
- Distribución por tipo (agente vs solo admin)

### 3. **Datos Completos de Cada Agente**
- **Información Personal**: ID, nombre, email, teléfono, cédula
- **Profesional**: Especialidad, comisiones, fecha de ingreso
- **Sistema**: Estado activo, fechas de creación/actualización
- **Metadatos**: Foto de perfil, biografía, creado por

### 4. **Análisis de Datos Inusuales**
- Agentes sin cédula
- Agentes sin teléfono
- Agentes sin biografía
- Agentes sin foto de perfil

### 5. **Análisis de Comisiones**
- Promedios por especialidad
- Valores mínimos y máximos
- Detección de comisiones anómalas

### 6. **Detección de Problemas**
- Comisiones muy altas o muy bajas
- Emails duplicados
- Datos faltantes críticos

## 🔧 Configuración de Conexión

### Para Base de Datos Directa
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database_name',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### Para API
```javascript
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  endpoint: '/api/agents'
};
```

## 📋 Campos Analizados

El script analiza todos estos campos de cada agente:

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `id` | Identificador único | Integer |
| `firebase_uid` | UID de Firebase | String |
| `nombre` | Nombre completo | String |
| `email` | Email profesional | String |
| `telefono` | Teléfono de contacto | String |
| `cedula` | Número de cédula | String |
| `especialidad` | Tipo de especialidad | String |
| `comision_ventas` | % comisión en ventas | Decimal |
| `comision_arriendos` | % comisión en arriendos | Decimal |
| `activo` | Estado activo en sistema | Boolean |
| `foto_perfil` | URL de foto de perfil | String |
| `biografia` | Biografía profesional | Text |
| `fecha_ingreso` | Fecha de ingreso | Date |
| `fecha_creacion` | Fecha de creación en sistema | Timestamp |
| `fecha_actualizacion` | Última actualización | Timestamp |
| `es_agente` | Si actúa como agente | Boolean |
| `creado_por` | Quién lo creó | String |

## ⚠️ Detección de Datos Inusuales

### Comisiones Sospechosas
- **Ventas**: < 1% o > 10%
- **Arriendos**: < 5% o > 20%

### Datos Faltantes Críticos
- Sin cédula
- Sin teléfono
- Sin especialidad definida

### Problemas de Integridad
- Emails duplicados
- Firebase UIDs duplicados
- Referencias rotas

## 🚨 Solución de Problemas

### Error: "relation does not exist"
- **Causa**: La tabla `administradores` no existe
- **Solución**: Ejecuta la migración de agentes primero

### Error: "column does not exist"
- **Causa**: Faltan columnas de agentes en la tabla
- **Solución**: Ejecuta la migración completa de agentes

### Error: "ECONNREFUSED"
- **Causa**: No se puede conectar a la base de datos
- **Solución**: Verifica que PostgreSQL esté ejecutándose

### Error: "Request timeout"
- **Causa**: La API tardó demasiado en responder
- **Solución**: Verifica la conexión y el rendimiento del servidor

## 💡 Consejos de Uso

1. **Para desarrollo local**: Usa la versión vía API
2. **Para producción**: Usa la versión directa de base de datos
3. **Para auditorías**: Ejecuta ambos scripts y compara resultados
4. **Para debugging**: Revisa los logs detallados del script

## 🔍 Ejemplo de Salida

```
🔍 ANALIZANDO TODOS LOS AGENTES INMOBILIARIOS...

📋 VERIFICANDO ESTRUCTURA DE LA TABLA...
Columnas disponibles en tabla administradores:
  - id: integer (nullable: NO)
  - firebase_uid: character varying (nullable: NO)
  - nombre: character varying (nullable: NO)
  - email: character varying (nullable: NO)
  ...

📊 ESTADÍSTICAS GENERALES:
  Total de registros: 15
  Agentes inmobiliarios: 12
  Solo administradores: 3
  Activos en sistema: 14
  Inactivos en sistema: 1

👥 AGENTES INMOBILIARIOS COMPLETOS:

--- AGENTE 1 ---
ID: 1
Firebase UID: agent_1234567890_abc123
Nombre: María González
Email: maria.gonzalez@homestate.com
...
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de error del script
2. Verifica la conectividad a la base de datos/API
3. Asegúrate de que las migraciones estén ejecutadas
4. Revisa que las credenciales sean correctas
