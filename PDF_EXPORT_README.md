# Funcionalidad de Exportar PDF - Transacciones por Edificio

## Descripción

Se ha implementado la funcionalidad de exportar a PDF para el reporte de transacciones por edificio. Esta funcionalidad permite generar reportes en formato PDF que incluyen:

- **Título del reporte** con el nombre del edificio seleccionado o "Todos los edificios"
- **Información del reporte** incluyendo fecha de generación y total de transacciones
- **Tabla detallada** con todas las transacciones incluyendo:
  - Edificio
  - Departamento
  - Tipo de transacción (Venta/Arriendo)
  - Cliente
  - Agente
  - Valor de la transacción
  - Comisión
  - Fecha
  - Estado

## Características

### ✅ Funcionalidades Implementadas

1. **Exportación dinámica**: Se adapta al edificio seleccionado
2. **Carga automática de librerías**: jsPDF se carga dinámicamente desde CDN
3. **Manejo robusto de errores**: Incluye try-catch y mensajes de error informativos
4. **Indicadores de carga**: Muestra toast de carga mientras genera el PDF
5. **Nombres de archivo inteligentes**: Incluye fecha y nombre del edificio
6. **Diseño profesional**: Tabla con colores alternados y formato profesional
7. **Carga singleton**: Evita cargar múltiples veces la misma librería

### 📋 Cómo usar

1. **Navegar al reporte**: Ir a la sección "Ventas y Arriendos" → "Reportes" → "Por Edificio"
2. **Seleccionar edificio**: Elegir "Todos los edificios" o un edificio específico
3. **Hacer clic en Exportar**: El botón "Exportar" generará el PDF automáticamente
4. **Descargar**: El archivo se descargará automáticamente con el nombre apropiado

### 📁 Estructura de archivos

```
components/
├── building-transactions-report.tsx    # Componente principal con funcionalidad PDF
├── simple-pdf-export.tsx              # Componente de prueba simplificado
└── ui/
    └── button.tsx                     # Botón de exportar

lib/
└── pdf-utils.ts                       # Utilidades para generación de PDF

types/
└── pdf.d.ts                          # Tipos para jsPDF

PDF_EXPORT_README.md                   # Este archivo
```

### 🔧 Configuración técnica

La funcionalidad utiliza:
- **jsPDF**: Para generar el documento PDF
- **CDN**: La librería se carga dinámicamente desde CDN para evitar dependencias adicionales
- **Singleton Pattern**: Evita cargar múltiples veces la misma librería
- **Error Handling**: Manejo robusto de errores con fallbacks

### 📊 Formato del PDF

El PDF generado incluye:

1. **Encabezado**:
   - Título del reporte
   - Fecha de generación
   - Estadísticas resumidas

2. **Tabla de transacciones**:
   - Columnas organizadas
   - Colores alternados para mejor legibilidad
   - Formato de moneda colombiana
   - Fechas en formato local

3. **Pie de página**:
   - Información del sistema
   - Paginación automática

### 🎨 Personalización

El diseño del PDF se puede personalizar modificando:

```typescript
// En lib/pdf-utils.ts
// Colores del encabezado de tabla
doc.setFillColor(59, 130, 246)  // Azul
doc.setTextColor(255, 255, 255)  // Blanco

// Tamaño de columnas
const columnWidth = 40
```

### 🚀 Próximas mejoras

1. **Exportación de otros reportes**: Extender a ingresos por edificio y distribución de comisiones
2. **Filtros adicionales**: Incluir filtros por fecha en el PDF
3. **Gráficos**: Agregar gráficos y estadísticas visuales
4. **Múltiples formatos**: Exportar también a Excel y CSV
5. **Plantillas**: Diferentes plantillas de diseño para diferentes tipos de reportes

### 🐛 Solución de problemas

**Problema**: Error "is not a constructor"
**Solución**: Se ha implementado una carga más robusta con verificaciones adicionales

**Problema**: El PDF no se genera
**Solución**: Verificar conexión a internet (necesaria para cargar librerías desde CDN)

**Problema**: Error de librería no encontrada
**Solución**: La librería se carga automáticamente con fallbacks, esperar unos segundos

**Problema**: Tabla muy ancha
**Solución**: Se ajusta automáticamente el ancho de columnas

### 📝 Notas de desarrollo

- La funcionalidad es completamente client-side
- No requiere instalación de dependencias adicionales
- Compatible con todos los navegadores modernos
- Manejo robusto de errores incluido
- Carga asíncrona de librerías para mejor rendimiento
- Implementación singleton para evitar conflictos

### 🔄 Cambios recientes

**Versión 2.0**:
- Implementación de `PDFGenerator` class para mejor organización
- Carga singleton de jsPDF para evitar conflictos
- Manejo más robusto de errores
- Fallbacks mejorados para diferentes CDNs
- Código más limpio y mantenible

### 🧪 Componente de prueba

Se incluye `SimplePDFExport` para probar la funcionalidad básica:

```typescript
import { SimplePDFExport } from "@/components/simple-pdf-export"

// Usar en cualquier componente
<SimplePDFExport />
```

Este componente genera un PDF de prueba simple para verificar que la funcionalidad funciona correctamente. 