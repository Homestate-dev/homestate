-- Script simple para eliminar solo las transacciones principales
-- ⚠️ ADVERTENCIA: Este script eliminará todas las transacciones de ventas y arriendos
-- Fecha: 2025-01-09

-- 1. Eliminar todas las transacciones de la tabla principal
DELETE FROM transacciones_departamentos;

-- 2. Eliminar todas las transacciones de la tabla alternativa
DELETE FROM transacciones_ventas_arriendos;

-- 3. Resetear secuencias de ID
ALTER SEQUENCE IF EXISTS transacciones_departamentos_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS transacciones_ventas_arriendos_id_seq RESTART WITH 1;

-- 4. Verificar eliminación
SELECT 
    'transacciones_departamentos' as tabla,
    COUNT(*) as registros_restantes
FROM transacciones_departamentos
UNION ALL
SELECT 
    'transacciones_ventas_arriendos' as tabla,
    COUNT(*) as registros_restantes
FROM transacciones_ventas_arriendos;

-- 5. Mensaje de confirmación
SELECT 'ELIMINACIÓN SIMPLE COMPLETADA: Todas las transacciones principales han sido eliminadas' as resultado; 