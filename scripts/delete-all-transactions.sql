-- Script para eliminar todas las transacciones registradas y datos asociados
-- ⚠️ ADVERTENCIA: Este script eliminará TODAS las transacciones de la base de datos
-- Fecha: 2025-01-09
-- Descripción: Eliminación completa de transacciones y datos relacionados

-- 1. Eliminar datos de historial de estados de transacciones
DELETE FROM historial_estados_transaccion;

-- 2. Eliminar estados de transacciones
DELETE FROM estados_transaccion;

-- 3. Eliminar comisiones de agentes (si existe la tabla)
-- Verificar si la tabla existe antes de eliminar
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comisiones_agentes') THEN
        DELETE FROM comisiones_agentes;
    END IF;
END $$;

-- 4. Eliminar leads y prospectos relacionados con transacciones
-- Verificar si la tabla existe antes de eliminar
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads_prospectos') THEN
        DELETE FROM leads_prospectos WHERE transaccion_id IS NOT NULL;
    END IF;
END $$;

-- 5. Eliminar histórico de estados de departamentos
-- Verificar si la tabla existe antes de eliminar
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historico_estados_departamentos') THEN
        DELETE FROM historico_estados_departamentos;
    END IF;
END $$;

-- 6. Eliminar todas las transacciones de la tabla principal
DELETE FROM transacciones_departamentos;

-- 7. Eliminar todas las transacciones de la tabla alternativa
DELETE FROM transacciones_ventas_arriendos;

-- 8. Resetear secuencias de ID para que empiecen desde 1
-- Para transacciones_departamentos
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transacciones_departamentos') THEN
        ALTER SEQUENCE IF EXISTS transacciones_departamentos_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Para transacciones_ventas_arriendos
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transacciones_ventas_arriendos') THEN
        ALTER SEQUENCE IF EXISTS transacciones_ventas_arriendos_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Para estados_transaccion
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'estados_transaccion') THEN
        ALTER SEQUENCE IF EXISTS estados_transaccion_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Para historial_estados_transaccion
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historial_estados_transaccion') THEN
        ALTER SEQUENCE IF EXISTS historial_estados_transaccion_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Para comisiones_agentes (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comisiones_agentes') THEN
        ALTER SEQUENCE IF EXISTS comisiones_agentes_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Para historico_estados_departamentos (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historico_estados_departamentos') THEN
        ALTER SEQUENCE IF EXISTS historico_estados_departamentos_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Para leads_prospectos (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads_prospectos') THEN
        ALTER SEQUENCE IF EXISTS leads_prospectos_id_seq RESTART WITH 1;
    END IF;
END $$;

-- 9. Verificar que todas las transacciones han sido eliminadas
SELECT 
    'transacciones_departamentos' as tabla,
    COUNT(*) as registros_restantes
FROM transacciones_departamentos
UNION ALL
SELECT 
    'transacciones_ventas_arriendos' as tabla,
    COUNT(*) as registros_restantes
FROM transacciones_ventas_arriendos
UNION ALL
SELECT 
    'estados_transaccion' as tabla,
    COUNT(*) as registros_restantes
FROM estados_transaccion
UNION ALL
SELECT 
    'historial_estados_transaccion' as tabla,
    COUNT(*) as registros_restantes
FROM historial_estados_transaccion;

-- 10. Mensaje de confirmación
SELECT 'ELIMINACIÓN COMPLETADA: Todas las transacciones han sido eliminadas de la base de datos' as resultado; 