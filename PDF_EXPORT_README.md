# Funcionalidad de Exportar PDF - Transacciones por Edificio

## Descripción

Se ha implementado la funcionalidad de exportar a PDF para el reporte de transacciones por edificio. Esta funcionalidad permite generar reportes en formato PDF que incluyen:

- **Título del reporte** con el nombre del edificio seleccionado o "Todos los edificios"
- **Información del reporte** incluyendo fecha de generación, total de transacciones, ventas, arriendos y valor total
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
2. **Carga automática de librerías**: jsPDF y autoTable se cargan dinámicamente desde CDN
3. **Manejo de errores**: Incluye try-catch y mensajes de error informativos
4. **Indicadores de carga**: Muestra toast de carga mientras genera el PDF
5. **Nombres de archivo inteligentes**: Incluye fecha y nombre del edificio
6. **Diseño profesional**: Tabla con colores alternados y formato profesional

### 📋 Cómo usar

1. **Navegar al reporte**: Ir a la sección "Ventas y Arriendos" → "Reportes" → "Por Edificio"
2. **Seleccionar edificio**: Elegir "Todos los edificios" o un edificio específico
3. **Hacer clic en Exportar**: El botón "Exportar" generará el PDF automáticamente
4. **Descargar**: El archivo se descargará automáticamente con el nombre apropiado

### 📁 Estructura de archivos

```
components/
├── building-transactions-report.tsx    # Componente principal con funcionalidad PDF
├── pdf-export-test.tsx                # Componente de prueba para verificar funcionalidad
└── ui/
    └── button.tsx                     # Botón de exportar

types/
└── pdf.d.ts                          # Tipos para jsPDF

PDF_EXPORT_README.md                   # Este archivo
```

### 🔧 Configuración técnica

La funcionalidad utiliza:
- **jsPDF**: Para generar el documento PDF
- **jsPDF-AutoTable**: Para crear tablas profesionales en el PDF
- **CDN**: Las librerías se cargan dinámicamente desde CDN para evitar dependencias adicionales

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
// Colores del encabezado de tabla
headStyles: {
  fillColor: [59, 130, 246],  // Azul
  textColor: 255               // Blanco
}

// Colores de filas alternadas
alternateRowStyles: {
  fillColor: [248, 250, 252]  // Gris claro
}
```

### 🚀 Próximas mejoras

1. **Exportación de otros reportes**: Extender a ingresos por edificio y distribución de comisiones
2. **Filtros adicionales**: Incluir filtros por fecha en el PDF
3. **Gráficos**: Agregar gráficos y estadísticas visuales
4. **Múltiples formatos**: Exportar también a Excel y CSV
5. **Plantillas**: Diferentes plantillas de diseño para diferentes tipos de reportes

### 🐛 Solución de problemas

**Problema**: El PDF no se genera
**Solución**: Verificar conexión a internet (necesaria para cargar librerías desde CDN)

**Problema**: Error de librería no encontrada
**Solución**: La librería se carga automáticamente, esperar unos segundos

**Problema**: Tabla muy ancha
**Solución**: El autoTable ajusta automáticamente el ancho de columnas

### 📝 Notas de desarrollo

- La funcionalidad es completamente client-side
- No requiere instalación de dependencias adicionales
- Compatible con todos los navegadores modernos
- Manejo robusto de errores incluido
- Carga asíncrona de librerías para mejor rendimiento 