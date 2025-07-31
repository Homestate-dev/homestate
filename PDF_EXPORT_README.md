# Funcionalidad de Exportar Reportes - Transacciones por Edificio

## Descripción

Se ha implementado la funcionalidad de exportar reportes para el reporte de transacciones por edificio. Esta funcionalidad permite generar reportes en formato **PDF real** que incluyen:

- **Logo de Homestate** y texto "HomEstate" en Poppins Light
- **Título del reporte** con el nombre del edificio seleccionado o "Todos los edificios"
- **Información del reporte** incluyendo fecha de generación y total de transacciones
- **Tabla dinámica** que se adapta según la selección:
  - **Todos los edificios**: Incluye columna "Edificio"
  - **Edificio específico**: Oculta columna "Edificio" (siempre el mismo)
- **Totales automáticos** al final de las columnas "Valor" y "Comisión"
- **Diseño profesional** con fila de totales destacada
- **Formato PDF A4** con márgenes optimizados para impresión

## Características

### ✅ Funcionalidades Implementadas

1. **Exportación dinámica**: Se adapta al edificio seleccionado
2. **Columnas inteligentes**: Oculta columna edificio cuando no es necesaria
3. **Totales automáticos**: Calcula y muestra totales de valor y comisión
4. **Generación en servidor**: Usa API externa para convertir HTML a PDF
5. **Manejo robusto de errores**: Incluye try-catch y mensajes de error informativos
6. **Indicadores de carga**: Muestra toast de carga mientras genera el PDF
7. **Nombres de archivo inteligentes**: Incluye fecha y nombre del edificio con extensión .pdf
8. **Diseño profesional**: Tabla con colores alternados y fila de totales destacada
9. **Logo de marca**: Incluye logo de Homestate y texto "HomEstate" en Poppins Light
10. **Formato PDF real**: Archivo PDF descargable, no HTML

### 📋 Cómo usar

1. **Navegar al reporte**: Ir a la sección "Ventas y Arriendos" → "Reportes" → "Por Edificio"
2. **Seleccionar edificio**: 
   - **"Todos los edificios"**: Muestra columna edificio y totales generales
   - **Edificio específico**: Oculta columna edificio y muestra totales del edificio
3. **Hacer clic en Exportar**: El botón "Exportar" generará el PDF automáticamente
4. **Descargar**: El archivo PDF se descargará automáticamente con el nombre apropiado

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
        └── route.ts                   # API del servidor para generar PDFs

public/
└── logo-qr.png                       # Logo de Homestate para los reportes

PDF_EXPORT_README.md                   # Este archivo
```

### 🔧 Configuración técnica

La funcionalidad utiliza:
- **API del servidor**: Para generar el contenido HTML del reporte
- **API externa HTML2PDF**: Para convertir HTML a PDF real
- **Blob API**: Para crear archivos PDF descargables en el navegador
- **Lógica dinámica**: Para mostrar/ocultar columnas según la selección
- **Cálculo de totales**: Automático para valor y comisión
- **Logo de marca**: Integrado desde `/public/logo-qr.png`
- **Fuente Poppins**: Cargada desde Google Fonts para el texto "HomEstate"

### 📊 Formato del reporte

El reporte generado incluye:

1. **Encabezado con marca**:
   - Logo de Homestate (64x64px)
   - Texto "HomEstate" en Poppins Light
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

4. **Formato PDF**:
   - Tamaño A4
   - Márgenes optimizados (20mm)
   - Fuente legible (12px para texto, 10px para tabla)
   - Saltos de página automáticos

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

// Configuración de página
@page {
  size: A4;
  margin: 20mm;
}
```

### 🚀 Próximas mejoras

1. **Exportación de otros reportes**: Extender a ingresos por edificio y distribución de comisiones
2. **Filtros adicionales**: Incluir filtros por fecha en el reporte
3. **Gráficos**: Agregar gráficos y estadísticas visuales
4. **Múltiples formatos**: Exportar también a Excel y CSV
5. **Plantillas**: Diferentes plantillas de diseño para diferentes tipos de reportes
6. **Subtotales**: Agregar subtotales por tipo de transacción
7. **Configuración de página**: Permitir diferentes tamaños de papel
8. **Marca de agua**: Agregar marca de agua personalizada

### 🐛 Solución de problemas

**Problema**: Error de librería no encontrada
**Solución**: Ya no depende de librerías externas, usa API externa HTML2PDF

**Problema**: Ciclo infinito al cargar
**Solución**: Eliminado completamente, usa generación en servidor

**Problema**: El PDF no se genera
**Solución**: Verificar que la API `/api/generate-pdf` esté funcionando

**Problema**: Archivo no se descarga
**Solución**: Verificar permisos del navegador para descargas

**Problema**: Totales no aparecen
**Solución**: Verificar que haya transacciones para calcular totales

**Problema**: Logo no aparece
**Solución**: Verificar que `/public/logo-qr.png` exista

### 📝 Notas de desarrollo

- La funcionalidad es híbrida (cliente-servidor con API externa)
- No requiere instalación de dependencias adicionales
- Compatible con todos los navegadores modernos
- Manejo robusto de errores incluido
- Generación rápida con API externa HTML2PDF
- Archivos PDF reales que se pueden abrir en cualquier visor
- **Lógica dinámica** para columnas según selección
- **Cálculo automático** de totales
- **Logo de marca** integrado
- **Formato profesional** A4

### 🔄 Cambios recientes

**Versión 5.0**:
- ✅ Generación de PDF real en lugar de HTML
- ✅ Logo de Homestate integrado (64x64px)
- ✅ Texto "HomEstate" en Poppins Light
- ✅ Formato A4 con márgenes optimizados
- ✅ API externa HTML2PDF para conversión
- ✅ Archivos .pdf descargables
- ✅ Diseño profesional para impresión

### 🧪 Componente de prueba

Se incluye `ServerPDFExport` para usar en otros componentes:

```typescript
import { ServerPDFExport } from "@/components/server-pdf-export"

// Usar en cualquier componente
<ServerPDFExport 
  title="Mi Reporte"
  data={tableData}
  headers={headers}
  fileName="mi_reporte.pdf"
/>
```

### 📊 Ventajas de la nueva implementación

1. **PDF real**: Archivos PDF descargables, no HTML
2. **Sin dependencias externas**: No requiere librerías locales
3. **Sin problemas de carga**: No hay ciclos infinitos ni timeouts
4. **Más rápido**: Generación directa con API externa
5. **Más confiable**: Sin problemas de CDN o red
6. **Más simple**: Código más limpio y fácil de mantener
7. **Compatible**: Funciona en todos los navegadores
8. **Escalable**: Fácil de extender a otros reportes
9. **Inteligente**: Se adapta automáticamente según la selección
10. **Profesional**: Totales destacados y diseño limpio
11. **Marca integrada**: Logo y texto "HomEstate" incluidos
12. **Formato impresión**: Optimizado para A4

### 🔧 Instalación y configuración

No se requiere instalación adicional. La funcionalidad está lista para usar:

1. **API del servidor**: Ya implementada en `/api/generate-pdf`
2. **Componentes**: Ya implementados y listos para usar
3. **Estilos**: Incluidos en la API del servidor
4. **Lógica dinámica**: Implementada en el componente principal
5. **Logo**: Ubicado en `/public/logo-qr.png`
6. **API externa**: HTML2PDF para conversión a PDF

### 🎯 Uso en producción

La funcionalidad está lista para producción:

- ✅ Sin dependencias externas locales
- ✅ Manejo robusto de errores
- ✅ Compatible con todos los navegadores
- ✅ Generación rápida y confiable
- ✅ Fácil de mantener y extender
- ✅ Columnas dinámicas según contexto
- ✅ Totales automáticos y precisos
- ✅ Diseño profesional con totales destacados
- ✅ Logo de marca integrado
- ✅ Formato PDF real para impresión 