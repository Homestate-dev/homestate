# Soluciones para React Error #310 - Guía Completa

## 🚨 Problema Identificado
El error **React #310** está relacionado con ciclos infinitos en hooks, especialmente `useMemo`, que causan re-renders constantes y eventualmente un crash de la aplicación.

## 🛠️ Soluciones Implementadas

### 1. **Detector de Re-renders Infinitos**
**Archivo**: `components/microsite-content.tsx`

Implementamos un sistema de detección que:
- Cuenta renders por ventana de tiempo (2 segundos)
- Detecta cuando hay más de 50 renders en 2 segundos
- En desarrollo: muestra warnings y traces
- En producción: muestra página de error controlada después de 100 renders
- Previene el crash total de la aplicación

```typescript
// Detectar re-renders infinitos
const renderCountRef = useRef(0)
const lastResetRef = useRef(Date.now())

renderCountRef.current += 1

// Resetear contador cada 2 segundos
const now = Date.now()
if (now - lastResetRef.current > 2000) {
  renderCountRef.current = 1
  lastResetRef.current = now
}

// Detectar posible ciclo infinito
if (renderCountRef.current > 50) {
  console.error(`⚠️ INFINITE RENDER DETECTED`)
  // ... manejo del error
}
```

### 2. **Reemplazo de useMemo Problemático**
**Archivo**: `components/microsite-content.tsx`

Reemplazamos el `useMemo` que causaba ciclos infinitos con una técnica más estable:

**Antes (problemático)**:
```typescript
const buildingImages = useMemo(() => {
  // ... lógica
}, [building?.url_imagen_principal, building?.imagenes_secundarias])
```

**Después (estable)**:
```typescript
const getBuildingImages = () => {
  // ... lógica de validación
}

const currentImages = getBuildingImages()
const buildingImages = (() => {
  // Solo actualizar la ref si las imágenes han cambiado realmente
  const newImagesStr = JSON.stringify(currentImages)
  const oldImagesStr = JSON.stringify(buildingImagesRef.current)
  
  if (newImagesStr !== oldImagesStr) {
    buildingImagesRef.current = currentImages
  }
  
  return buildingImagesRef.current
})()
```

### 3. **Validaciones Defensivas Mejoradas**
**Archivo**: `app/edificio/[permalink]/page.tsx`

Implementamos validaciones exhaustivas:
- Validación estricta del permalink
- Verificación completa de la estructura de datos
- Construcción de objetos "seguros" con valores por defecto
- Logging detallado para debugging en producción

```typescript
// Validar estructura del building más profundamente
const safeBuilding = {
  ...data.building,
  id: data.building.id || 0,
  nombre: data.building.nombre || '',
  // ... más validaciones
}
```

### 4. **Mejoras en la Base de Datos**
**Archivo**: `lib/database.ts`

Enhancements en `getBuildingWithDepartmentsByPermalink`:
- Validación del permalink de entrada
- Verificación de datos esenciales
- Valores por defecto seguros
- Mejor manejo de errores con logging detallado

### 5. **Sistema de Logging de Errores**
**Archivo**: `app/api/log-error/route.ts`

Endpoint para capturar errores del cliente:
- Detección específica del error React #310
- Logging estructurado en el servidor
- Preparado para integración con servicios de monitoreo (Sentry, LogRocket)

### 6. **Script de Testing de API**
**Archivo**: `scripts/test-api-data.js`

Script para debuggear la estructura de datos:
```bash
node scripts/test-api-data.js
```

El script verifica:
- Estructura de datos del edificio
- Tipos de datos correctos
- Serialización JSON
- Posibles problemas en los datos

## 🔧 Herramientas de Debugging Implementadas

### 1. **Detector de Renders** (Desarrollo)
Componente `DebugRenderInfo` que muestra:
- Contador de renders en tiempo real
- Overlay visual en desarrollo
- No afecta producción

### 2. **Logs Estructurados**
Sistema de logging que identifica:
- Errores React #310 específicamente
- Información del contexto (permalink, datos)
- Stack traces completos
- IDs únicos de error para tracking

### 3. **Modo Seguro de Renderizado**
Cuando se detecta un ciclo infinito:
- Muestra página de error controlada
- Botón de recarga
- Previene crash total de la aplicación
- Logging automático del problema

## 📊 Cómo Debuggear Problemas Similares

### Paso 1: Usar las Herramientas Implementadas
1. **En desarrollo**: Observar el contador de renders en pantalla
2. **En consola**: Buscar warnings de renders excesivos
3. **En producción**: Verificar logs del servidor

### Paso 2: Identificar el Origen
```bash
# Ejecutar script de testing
node scripts/test-api-data.js

# Verificar estructura de datos
# Buscar diferencias en props entre renders
# Verificar dependencias de hooks
```

### Paso 3: Análisis de Performance
Usar React DevTools:
- Profiler para identificar componentes problemáticos
- Component tree para verificar re-renders
- Timeline para detectar loops

### Paso 4: Verificación en Producción
- Verificar logs en `/api/log-error`
- Monitorear métricas de error
- Testing en entorno similar a producción

## 🚀 Deployment y Monitoreo

### Variables de Entorno Requeridas
```bash
# Firebase (ya configurado)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... otras variables Firebase

# Base de datos (ya configurado)
DATABASE_URL=...
```

### Testing Post-Deploy
1. Verificar que no hay errores en consola del navegador
2. Probar carga de páginas de edificios
3. Verificar logs del servidor
4. Testing en diferentes navegadores

## 📝 Próximos Pasos Recomendados

### Implementación de Monitoreo
1. **Sentry**: Para tracking automático de errores
2. **LogRocket**: Para session replay de errores
3. **Google Analytics**: Para métricas de errores

### Mejoras Adicionales
1. **React Error Boundaries**: En más componentes
2. **Performance Monitoring**: Métricas de render time
3. **A/B Testing**: Para validar soluciones

## ⚡ Resumen de Archivos Modificados

1. ✅ `components/microsite-content.tsx` - Detector y fixes de useMemo
2. ✅ `app/edificio/[permalink]/page.tsx` - Validaciones defensivas
3. ✅ `lib/database.ts` - Mejoras en queries y validaciones
4. ✅ `components/debug-rerender-detector.tsx` - Herramientas de debugging
5. ✅ `app/api/log-error/route.ts` - Sistema de logging
6. ✅ `scripts/test-api-data.js` - Script de testing
7. ✅ `FIREBASE_OAUTH_SETUP.md` - Configuración Firebase

## 🎯 Resultado Esperado

Con estas implementaciones, el error React #310 debería estar resuelto y tendrás:
- ✅ Detección temprana de problemas de renderizado
- ✅ Páginas de error elegantes en lugar de crashes
- ✅ Logging detallado para debugging
- ✅ Herramientas para prevenir problemas futuros
- ✅ Sistema robusto de validación de datos

El enfoque es **defensivo** y **preventivo**, diseñado para capturar y manejar errores antes de que afecten la experiencia del usuario. 