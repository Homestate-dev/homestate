-- Script para corregir TODAS las restricciones de clave foránea
-- que apuntan a la tabla agentes_inmobiliarios (deprecada)

-- =====================================================
-- PASO 1: ELIMINAR TODAS LAS RESTRICCIONES INCORRECTAS
-- =====================================================

-- Eliminar restricción en transacciones_departamentos
ALTER TABLE transacciones_departamentos 
DROP CONSTRAINT IF EXISTS transacciones_departamentos_agente_id_fkey;

-- Eliminar restricciones en departamentos
ALTER TABLE departamentos 
DROP CONSTRAINT IF EXISTS departamentos_agente_venta_id_fkey;

ALTER TABLE departamentos 
DROP CONSTRAINT IF EXISTS departamentos_agente_arriendo_id_fkey;

-- =====================================================
-- PASO 2: CREAR NUEVAS RESTRICCIONES CORRECTAS
-- =====================================================

-- Crear restricción en transacciones_departamentos
ALTER TABLE transacciones_departamentos 
ADD CONSTRAINT transacciones_departamentos_agente_id_fkey 
FOREIGN KEY (agente_id) REFERENCES administradores(id);

-- Crear restricciones en departamentos
ALTER TABLE departamentos 
ADD CONSTRAINT departamentos_agente_venta_id_fkey 
FOREIGN KEY (agente_venta_id) REFERENCES administradores(id);

ALTER TABLE departamentos 
ADD CONSTRAINT departamentos_agente_arriendo_id_fkey 
FOREIGN KEY (agente_arriendo_id) REFERENCES administradores(id);

-- =====================================================
-- PASO 3: VERIFICAR QUE LAS CORRECCIONES FUNCIONARON
-- =====================================================

-- Verificar restricciones en transacciones_departamentos
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'transacciones_departamentos';

-- Verificar restricciones en departamentos
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'departamentos';

-- =====================================================
-- PASO 4: VERIFICAR QUE EXISTE EL ADMINISTRADOR ID 1
-- =====================================================

-- Verificar que existe el administrador ID 1
SELECT id, nombre, email 
FROM administradores 
WHERE id = 1;

-- =====================================================
-- PASO 5: VERIFICAR QUE NO HAY REFERENCIAS ROTAS
-- =====================================================

-- Verificar referencias rotas en transacciones_departamentos
SELECT 
    t.id,
    t.agente_id,
    'transacciones_departamentos' as tabla
FROM transacciones_departamentos t
LEFT JOIN administradores a ON t.agente_id = a.id
WHERE a.id IS NULL;

-- Verificar referencias rotas en departamentos
SELECT 
    d.id,
    d.agente_venta_id as agente_id,
    'departamentos (venta)' as tabla
FROM departamentos d
LEFT JOIN administradores a ON d.agente_venta_id = a.id
WHERE d.agente_venta_id IS NOT NULL AND a.id IS NULL

UNION ALL

SELECT 
    d.id,
    d.agente_arriendo_id as agente_id,
    'departamentos (arriendo)' as tabla
FROM departamentos d
LEFT JOIN administradores a ON d.agente_arriendo_id = a.id
WHERE d.agente_arriendo_id IS NOT NULL AND a.id IS NULL;
