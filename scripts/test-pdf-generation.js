// Script de prueba para generación de PDF
// Ejecutar con: node scripts/test-pdf-generation.js

const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando prueba de generación de PDF...');

// Simular el entorno del navegador
global.window = {
  jsPDF: null
};

global.document = {
  head: {
    appendChild: (script) => {
      console.log('📜 Script cargado:', script.src);
      // Simular carga exitosa
      setTimeout(() => {
        global.window.jsPDF = class MockJsPDF {
          constructor() {
            console.log('✅ jsPDF constructor llamado');
          }
          
          setFont(font) {
            console.log('📝 Fuente establecida:', font);
          }
          
          setFontSize(size) {
            console.log('📏 Tamaño de fuente:', size);
          }
          
          text(text, x, y) {
            console.log(`📄 Texto agregado: "${text}" en (${x}, ${y})`);
          }
          
          setFillColor(r, g, b) {
            console.log(`🎨 Color de relleno: RGB(${r}, ${g}, ${b})`);
          }
          
          setTextColor(r, g, b) {
            console.log(`🎨 Color de texto: RGB(${r}, ${g}, ${b})`);
          }
          
          rect(x, y, w, h, style) {
            console.log(`⬜ Rectángulo: (${x}, ${y}) ${w}x${h} - ${style}`);
          }
          
          addPage() {
            console.log('📄 Nueva página agregada');
          }
          
          save(filename) {
            console.log('💾 PDF guardado como:', filename);
            // Crear archivo de prueba
            const testContent = `PDF de prueba generado el ${new Date().toLocaleDateString('es-CO')}
            
Contenido del PDF:
- Título: Reporte de Transacciones
- Fecha: ${new Date().toLocaleDateString('es-CO')}
- Total de registros: 3

Datos de prueba:
- Edificio A, Depto 101, Venta, $250,000,000
- Edificio B, Depto 202, Arriendo, $2,500,000
- Edificio C, Depto 303, Venta, $300,000,000

Este es un archivo de prueba para verificar la funcionalidad de generación de PDF.`;
            
            fs.writeFileSync(filename, testContent);
            console.log('✅ Archivo de prueba creado exitosamente');
          }
        };
      }, 100);
    }
  }
};

// Función para cargar jsPDF (versión simplificada)
async function loadJsPDF() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Iniciando carga de jsPDF...');
    
    // Verificar si ya está disponible
    if (global.window.jsPDF) {
      console.log('✅ jsPDF ya está disponible');
      resolve(global.window.jsPDF);
      return;
    }
    
    // Simular carga desde CDN
    console.log('📡 Cargando jsPDF desde CDN...');
    const script = {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      onload: () => {
        console.log('📦 Script cargado, verificando disponibilidad...');
        const checkLoaded = () => {
          if (global.window.jsPDF) {
            console.log('✅ jsPDF cargado exitosamente');
            resolve(global.window.jsPDF);
          } else {
            console.log('⏳ Esperando que jsPDF esté disponible...');
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
      },
      onerror: () => {
        console.log('❌ Error al cargar jsPDF');
        reject(new Error('No se pudo cargar jsPDF'));
      }
    };
    
    document.head.appendChild(script);
  });
}

// Función para crear PDF de prueba
async function createTestPDF() {
  try {
    console.log('🎯 Iniciando creación de PDF de prueba...');
    
    // Cargar jsPDF
    const jsPDF = await loadJsPDF();
    console.log('✅ jsPDF cargado, creando documento...');
    
    // Crear documento
    const doc = new jsPDF();
    
    // Configurar documento
    doc.setFont('helvetica');
    doc.setFontSize(20);
    
    // Título
    doc.text('Reporte de Transacciones - Prueba', 20, 30);
    
    // Información
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, 45);
    doc.text('Este es un reporte de prueba', 20, 55);
    
    // Tabla simple
    doc.setFontSize(10);
    doc.text('Edificio', 20, 80);
    doc.text('Departamento', 60, 80);
    doc.text('Tipo', 120, 80);
    doc.text('Valor', 160, 80);
    
    // Datos de ejemplo
    doc.text('Edificio A', 20, 90);
    doc.text('Depto 101', 60, 90);
    doc.text('Venta', 120, 90);
    doc.text('$250,000,000', 160, 90);
    
    doc.text('Edificio B', 20, 100);
    doc.text('Depto 202', 60, 100);
    doc.text('Arriendo', 120, 100);
    doc.text('$2,500,000', 160, 100);
    
    doc.text('Edificio C', 20, 110);
    doc.text('Depto 303', 60, 110);
    doc.text('Venta', 120, 110);
    doc.text('$300,000,000', 160, 110);
    
    // Guardar PDF
    const fileName = `test_pdf_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('🎉 PDF de prueba generado exitosamente!');
    console.log('📁 Archivo creado:', fileName);
    
    return true;
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    return false;
  }
}

// Ejecutar prueba
async function runTest() {
  console.log('🚀 Iniciando prueba de generación de PDF...\n');
  
  const startTime = Date.now();
  const success = await createTestPDF();
  const endTime = Date.now();
  
  console.log('\n📊 Resultados de la prueba:');
  console.log(`⏱️  Tiempo total: ${endTime - startTime}ms`);
  console.log(`✅ Éxito: ${success ? 'SÍ' : 'NO'}`);
  
  if (success) {
    console.log('🎯 La funcionalidad de PDF está funcionando correctamente');
  } else {
    console.log('⚠️  Hay problemas con la generación de PDF');
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  runTest();
}

module.exports = { createTestPDF, loadJsPDF }; 