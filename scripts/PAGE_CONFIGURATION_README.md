# Configuración de Página - HomEstate

Este conjunto de scripts permite crear y configurar la tabla `page_configuration` en la base de datos para almacenar la configuración global de la página web (número de WhatsApp y link de Tally).

## 📋 Archivos Incluidos

- **`create-page-configuration-table.sql`** - Script SQL para crear la tabla
- **`apply-page-configuration-table.js`** - Script Node.js para ejecutar la creación
- **`run-page-configuration-setup.ps1`** - Script PowerShell para Windows
- **`test-page-configuration.js`** - Script de pruebas y verificación
- **`PAGE_CONFIGURATION_README.md`** - Este archivo de instrucciones

## 🚀 Instalación y Configuración

### Opción 1: Usando PowerShell (Recomendado para Windows)

1. **Navega al directorio scripts:**
   ```powershell
   cd scripts
   ```

2. **Ejecuta el script PowerShell simplificado:**
   ```powershell
   .\run-page-config-setup.ps1
   ```

3. **Sigue las instrucciones en pantalla:**
   - El script verificará Node.js y las dependencias
   - Usará la configuración de base de datos del proyecto
   - Creará la tabla automáticamente

### Opción 2: Usando Node.js directamente

1. **Instala la dependencia pg si no está instalada:**
   ```bash
   npm install pg
   ```

2. **Ejecuta el script simplificado:**
   ```bash
   node scripts/setup-page-configuration.js
   ```

**Nota:** Los scripts ya están configurados para usar la base de datos del proyecto:
- **Host:** c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com
- **Base de datos:** dauaho3sghau5i
- **Usuario:** ufcmrjr46j97t8
- **SSL:** Habilitado

## 🧪 Verificación y Pruebas

### Ejecutar pruebas completas:
```bash
node scripts/test-page-configuration.js
```

### Ver solo información de la tabla:
```bash
node scripts/test-page-configuration.js --info
```

## 📊 Estructura de la Tabla

La tabla `page_configuration` incluye:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Identificador único (auto-incrementable) |
| `whatsapp_number` | VARCHAR(20) | Número de WhatsApp para contacto |
| `tally_link` | TEXT | Enlace del formulario Tally |
| `created_at` | TIMESTAMP | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Características especiales:
- **Trigger automático** para actualizar `updated_at` en cada modificación
- **Índices** para búsquedas rápidas
- **Datos por defecto** insertados automáticamente
- **Comentarios** descriptivos en la base de datos

## 🔧 Funcionalidades Incluidas

### 1. Creación de Tabla
- Crea la tabla si no existe
- Inserta datos por defecto
- Configura triggers automáticos

### 2. Verificación
- Comprueba la estructura de la tabla
- Verifica la existencia de triggers
- Valida la funcionalidad de `updated_at`

### 3. Pruebas
- Inserción de datos de prueba
- Actualización de datos
- Verificación de triggers
- Limpieza automática de datos de prueba

## 📱 Uso en la Aplicación

Una vez creada la tabla, puedes usarla en tu componente `PageConfiguration`:

### Ejemplo de consulta:
```sql
SELECT whatsapp_number, tally_link, updated_at 
FROM page_configuration 
ORDER BY updated_at DESC 
LIMIT 1;
```

### Ejemplo de inserción/actualización:
```sql
-- Insertar nueva configuración
INSERT INTO page_configuration (whatsapp_number, tally_link) 
VALUES ('+56 9 1234 5678', 'https://tally.so/r/example');

-- Actualizar configuración existente
UPDATE page_configuration 
SET whatsapp_number = '+56 9 8765 4321', 
    tally_link = 'https://tally.so/r/updated'
WHERE id = 1;
```

## 🚨 Solución de Problemas

### Error de conexión:
```
❌ Error al ejecutar el script: connect ECONNREFUSED
```
**Solución:** Verifica que PostgreSQL esté ejecutándose y las credenciales sean correctas.

### Error de autenticación:
```
❌ Error al ejecutar el script: password authentication failed
```
**Solución:** Verifica el usuario y contraseña de la base de datos.

### Error de base de datos no encontrada:
```
❌ Error al ejecutar el script: database "homestate" does not exist
```
**Solución:** Crea la base de datos o verifica el nombre.

### Dependencia pg no encontrada:
```
❌ Cannot find module 'pg'
```
**Solución:** Ejecuta `npm install pg` en el directorio del proyecto.

## 🔄 Próximos Pasos

1. **Conectar el componente PageConfiguration** a la base de datos
2. **Crear API endpoints** para leer/escribir configuración
3. **Implementar persistencia** de datos en el frontend
4. **Agregar validaciones** de formato para WhatsApp y Tally

## 📞 Soporte

Si encuentras problemas:
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma las credenciales de la base de datos
3. Ejecuta el script de pruebas para diagnóstico
4. Revisa los logs de error para más detalles

---

**Nota:** Este script está diseñado para PostgreSQL. Si usas otra base de datos, necesitarás adaptar el script SQL correspondiente.
