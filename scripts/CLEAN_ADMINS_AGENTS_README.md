# 🧹 Scripts de Limpieza de Administradores y Agentes

## 📋 Descripción

Este conjunto de scripts está diseñado para realizar una **limpieza completa** del sistema de usuarios de HomEstate, dejando únicamente el administrador principal (`homestate.dev@gmail.com`).

## 🎯 Objetivos

1. **Mantener SOLO** el administrador principal (`homestate.dev@gmail.com`)
2. **Eliminar TODOS** los demás administradores
3. **Eliminar TODOS** los agentes inmobiliarios
4. **Limpiar referencias** y secuencias relacionadas

## ⚠️ ADVERTENCIAS IMPORTANTES

- **🚨 IRREVERSIBLE:** Esta operación elimina datos permanentemente
- **🚨 CRÍTICO:** Solo mantiene un usuario en todo el sistema
- **🚨 BACKUP:** Se recomienda hacer backup antes de ejecutar
- **🚨 PRODUCCIÓN:** Solo usar en entornos de desarrollo/testing

## 📁 Archivos Incluidos

### 1. `clean-admins-agents.js` - Script Principal (Node.js)
- **Funcionalidad:** Script completo con confirmaciones interactivas
- **Características:**
  - Verificaciones de seguridad
  - Confirmaciones dobles del usuario
  - Reportes detallados del proceso
  - Manejo de errores robusto
  - Reseteo automático de secuencias

### 2. `clean-admins-agents.sql` - Script SQL Directo
- **Funcionalidad:** Script SQL puro para ejecutar directamente en la base de datos
- **Características:**
  - Ejecución directa en PostgreSQL
  - Verificaciones automáticas
  - Reportes de estado final
  - Sin confirmaciones interactivas

### 3. `run-clean-admins-agents.ps1` - Script de PowerShell
- **Funcionalidad:** Wrapper de PowerShell para ejecutar el script de Node.js
- **Características:**
  - Verificación de dependencias
  - Instalación automática de paquetes
  - Interfaz de usuario mejorada
  - Manejo de errores de PowerShell

## 🚀 Cómo Usar

### Opción 1: Script de PowerShell (Recomendado para Windows)

```powershell
# Navegar a la carpeta de scripts
cd scripts

# Ejecutar el script de PowerShell
.\run-clean-admins-agents.ps1
```

### Opción 2: Script de Node.js Directo

```bash
# Navegar a la carpeta de scripts
cd scripts

# Instalar dependencias (si no están instaladas)
npm install pg

# Ejecutar el script
node clean-admins-agents.js
```

### Opción 3: Script SQL Directo

```sql
-- Conectar a la base de datos PostgreSQL
-- Ejecutar directamente el archivo SQL
\i clean-admins-agents.sql
```

## 🔧 Requisitos Previos

### Para Scripts de Node.js:
- **Node.js** instalado (versión 14 o superior)
- **Paquete `pg`** (se instala automáticamente si es necesario)

### Para Scripts de PowerShell:
- **PowerShell 5.1** o superior
- **Node.js** instalado
- **Permisos** de ejecución de scripts

### Para Scripts SQL:
- **PostgreSQL** cliente
- **Acceso directo** a la base de datos

## 📊 Proceso de Limpieza

### Fase 1: Verificación
- ✅ Conectar a la base de datos
- ✅ Verificar existencia del administrador principal
- ✅ Contar usuarios actuales

### Fase 2: Limpieza de Agentes
- 🗑️ Eliminar TODOS los agentes inmobiliarios
- 🔄 Resetear secuencia de agentes

### Fase 3: Limpieza de Administradores
- 🗑️ Eliminar todos los administradores excepto `homestate.dev@gmail.com`
- 🔄 Resetear secuencia de administradores

### Fase 4: Verificación Final
- ✅ Contar usuarios restantes
- ✅ Verificar secuencias
- ✅ Generar reporte final

## 🛡️ Medidas de Seguridad

1. **Confirmación Doble:** Requiere escribir "LIMPIAR" y luego "SI"
2. **Verificación Previo:** Confirma que existe el administrador principal
3. **Rollback Implícito:** Si falla, no se elimina nada
4. **Logs Detallados:** Registra cada paso del proceso
5. **Validación de Estado:** Verifica el resultado final

## 📈 Resultado Esperado

### Estado Final:
- **Administradores:** 1 (solo `homestate.dev@gmail.com`)
- **Agentes:** 0 (todos eliminados)
- **Secuencias:** Reseteadas a 1
- **Base de datos:** Limpia y lista para uso

## 🔍 Verificación Post-Limpieza

### 1. Verificar Usuarios:
```sql
SELECT COUNT(*) as total_administradores FROM administradores;
SELECT COUNT(*) as total_agentes FROM agentes_inmobiliarios;
```

### 2. Verificar Administrador Principal:
```sql
SELECT id, nombre, email, activo FROM administradores WHERE email = 'homestate.dev@gmail.com';
```

### 3. Verificar Secuencias:
```sql
SELECT sequence_name, last_value FROM information_schema.sequences 
WHERE sequence_name IN ('administradores_id_seq', 'agentes_inmobiliarios_id_seq');
```

## 🚨 Solución de Problemas

### Error: "No se encontró el administrador principal"
- **Causa:** El usuario `homestate.dev@gmail.com` no existe
- **Solución:** Crear primero el administrador principal antes de ejecutar la limpieza

### Error: "Paquete pg no está instalado"
- **Causa:** Dependencia faltante
- **Solución:** Ejecutar `npm install pg` manualmente

### Error: "Permiso denegado"
- **Causa:** Falta de permisos en PowerShell
- **Solución:** Ejecutar como administrador o cambiar política de ejecución

## 📞 Soporte

Si encuentras problemas con estos scripts:

1. **Revisar logs:** Los scripts proporcionan información detallada
2. **Verificar dependencias:** Asegúrate de que Node.js y pg estén instalados
3. **Revisar permisos:** Verifica acceso a la base de datos
4. **Backup:** Siempre haz backup antes de ejecutar scripts de limpieza

## 📝 Notas Adicionales

- **Recomendado:** Usar el script de PowerShell en Windows
- **Alternativo:** Usar el script de Node.js en cualquier sistema
- **Avanzado:** Usar el script SQL para ejecución directa
- **Seguridad:** Estos scripts están diseñados para ser seguros pero críticos

---

**⚠️ RECUERDA: Esta operación es IRREVERSIBLE. Asegúrate de estar 100% seguro antes de ejecutar.**
