# Funcionalidad de Exportar Reportes - Transacciones por Edificio

## Descripción

Se ha implementado la funcionalidad de exportar reportes para el reporte de transacciones por edificio. Esta funcionalidad permite generar reportes en formato HTML que incluyen:

- **Título del reporte** con el nombre del edificio seleccionado o "Todos los edificios"
- **Información del reporte** incluyendo fecha de generación y total de transacciones
- **Tabla dinámica** que se adapta según la selección:
  - **Todos los edificios**: Incluye columna "Edificio"
  - **Edificio específico**: Oculta columna "Edificio" (siempre el mismo)
- **Totales automáticos** al final de las columnas "Valor" y "Comisión"
- **Diseño profesional** con fila de totales destacada

## Características

### ✅ Funcionalidades Implementadas

1. **Exportación dinámica**: Se adapta al edificio seleccionado
2. **Columnas inteligentes**: Oculta columna edificio cuando no es necesaria
3. **Totales automáticos**: Calcula y muestra totales de valor y comisión
4. **Generación en servidor**: No depende de librerías externas en el cliente
5. **Manejo robusto de errores**: Incluye try-catch y mensajes de error informativos
6. **Indicadores de carga**: Muestra toast de carga mientras genera el reporte
7. **Nombres de archivo inteligentes**: Incluye fecha y nombre del edificio
8. **Diseño profesional**: Tabla con colores alternados y fila de totales destacada
9. **Sin dependencias externas**: No requiere jsPDF ni otras librerías

### 📋 Cómo usar

1. **Navegar al reporte**: Ir a la sección "Ventas y Arriendos" → "Reportes" → "Por Edificio"
2. **Seleccionar edificio**: 
   - **"Todos los edificios"**: Muestra columna edificio y totales generales
   - **Edificio específico**: Oculta columna edificio y muestra totales del edificio
3. **Hacer clic en Exportar**: El botón "Exportar" generará el reporte automáticamente
4. **Descargar**: El archivo se descargará automáticamente con el nombre apropiado

### 📊 Comportamiento de columnas

#### Para "Todos los edificios":
```
| Edificio | Depto | Tipo | Cliente | Agente | Valor | Comisión | Fecha | Estado |
|----------|-------|------|---------|--------|-------|----------|-------|--------|
| Edificio A | 101 | Venta | Juan | Agente 1 | $250M | $7.5M | 15/01/2024 | Completada |
| Edificio B | 202 | Arriendo | María | Agente 2 | $2.5M | $75K | 20/01/2024 | En Proceso |
| | TOTAL | | | | $252.5M | $7.575M | | |
```

#### Para edificio específico:
```
| Depto | Tipo | Cliente | Agente | Valor | Comisión | Fecha | Estado |
|-------|------|---------|--------|-------|----------|-------|--------|
| 101 | Venta | Juan | Agente 1 | $250M | $7.5M | 15/01/2024 | Completada |
| 202 | Arriendo | María | Agente 2 | $2.5M | $75K | 20/01/2024 | En Proceso |
| TOTAL | | | | $252.5M | $7.575M | | |
```

### 📁 Estructura de archivos

```
components/
├── building-transactions-report.tsx    # Componente principal con funcionalidad de exportar
├── server-pdf-export.tsx              # Componente reutilizable para exportar
└── ui/
    └── button.tsx                     # Botón de exportar

app/
└── api/
    └── generate-pdf/
        └── route.ts                   # API del servidor para generar reportes

PDF_EXPORT_README.md                   # Este archivo
```

### 🔧 Configuración técnica

La funcionalidad utiliza:
- **API del servidor**: Para generar el contenido HTML del reporte
- **Blob API**: Para crear archivos descargables en el navegador
- **Lógica dinámica**: Para mostrar/ocultar columnas según la selección
- **Cálculo de totales**: Automático para valor y comisión
- **Sin dependencias externas**: No requiere librerías adicionales

### 📊 Formato del reporte

El reporte generado incluye:

1. **Encabezado**:
   - Título del reporte
   - Fecha de generación
   - Estadísticas resumidas

2. **Tabla dinámica**:
   - Columnas que se adaptan según la selección
   - Colores alternados para mejor legibilidad
   - Formato de moneda colombiana
   - Fechas en formato local
   - **Fila de totales destacada** al final

3. **Pie de página**:
   - Información del sistema
   - Marca de agua

### 🎨 Personalización

El diseño del reporte se puede personalizar modificando:

```typescript
// En app/api/generate-pdf/route.ts
// Estilos para la fila de totales
.total-row { background-color: #e5f3ff !important; font-weight: bold; }
.total-row td { border-top: 2px solid #3b82f6; }

// Colores del encabezado de tabla
th { background-color: #3b82f6; color: white; }

// Colores de filas alternadas
tr:nth-child(even) { background-color: #f8f9fa; }
```

### 🚀 Próximas mejoras

1. **Exportación de otros reportes**: Extender a ingresos por edificio y distribución de comisiones
2. **Filtros adicionales**: Incluir filtros por fecha en el reporte
3. **Gráficos**: Agregar gráficos y estadísticas visuales
4. **Múltiples formatos**: Exportar también a Excel y CSV
5. **Plantillas**: Diferentes plantillas de diseño para diferentes tipos de reportes
6. **Subtotales**: Agregar subtotales por tipo de transacción

### 🐛 Solución de problemas

**Problema**: Error de librería no encontrada
**Solución**: Ya no depende de librerías externas, usa API del servidor

**Problema**: Ciclo infinito al cargar
**Solución**: Eliminado completamente, usa generación en servidor

**Problema**: El reporte no se genera
**Solución**: Verificar que la API `/api/generate-pdf` esté funcionando

**Problema**: Archivo no se descarga
**Solución**: Verificar permisos del navegador para descargas

**Problema**: Totales no aparecen
**Solución**: Verificar que haya transacciones para calcular totales

### 📝 Notas de desarrollo

- La funcionalidad es híbrida (cliente-servidor)
- No requiere instalación de dependencias adicionales
- Compatible con todos los navegadores modernos
- Manejo robusto de errores incluido
- Generación rápida sin dependencias externas
- Archivos HTML que se pueden abrir en cualquier navegador
- **Lógica dinámica** para columnas según selección
- **Cálculo automático** de totales

### 🔄 Cambios recientes

**Versión 4.0**:
- ✅ Columnas dinámicas según selección
- ✅ Totales automáticos de valor y comisión
- ✅ Fila de totales destacada visualmente
- ✅ Lógica inteligente para mostrar/ocultar columna edificio
- ✅ Cálculo preciso de totales
- ✅ Diseño mejorado con estilos especiales para totales

### 🧪 Componente de prueba

Se incluye `ServerPDFExport` para usar en otros componentes:

```typescript
import { ServerPDFExport } from "@/components/server-pdf-export"

// Usar en cualquier componente
<ServerPDFExport 
  title="Mi Reporte"
  data={tableData}
  headers={headers}
  fileName="mi_reporte.html"
/>
```

### 📊 Ventajas de la nueva implementación

1. **Sin dependencias externas**: No requiere jsPDF ni otras librerías
2. **Sin problemas de carga**: No hay ciclos infinitos ni timeouts
3. **Más rápido**: Generación directa en servidor
4. **Más confiable**: Sin problemas de CDN o red
5. **Más simple**: Código más limpio y fácil de mantener
6. **Compatible**: Funciona en todos los navegadores
7. **Escalable**: Fácil de extender a otros reportes
8. **Inteligente**: Se adapta automáticamente según la selección
9. **Profesional**: Totales destacados y diseño limpio

### 🔧 Instalación y configuración

No se requiere instalación adicional. La funcionalidad está lista para usar:

1. **API del servidor**: Ya implementada en `/api/generate-pdf`
2. **Componentes**: Ya implementados y listos para usar
3. **Estilos**: Incluidos en la API del servidor
4. **Lógica dinámica**: Implementada en el componente principal

### 🎯 Uso en producción

La funcionalidad está lista para producción:

- ✅ Sin dependencias externas
- ✅ Manejo robusto de errores
- ✅ Compatible con todos los navegadores
- ✅ Generación rápida y confiable
- ✅ Fácil de mantener y extender
- ✅ Columnas dinámicas según contexto
- ✅ Totales automáticos y precisos
- ✅ Diseño profesional con totales destacados 