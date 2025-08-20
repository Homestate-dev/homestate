-- Script para corregir las restricciones de clave foránea
-- que aún apuntan a la tabla agentes_inmobiliarios (deprecada)

-- 1. VERIFICAR RESTRICCIONES EXISTENTES
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
    AND tc.table_name = 'transacciones_departamentos'
    AND ccu.table_name = 'agentes_inmobiliarios';

-- 2. ELIMINAR RESTRICCIONES DEPRECADAS
-- Eliminar la restricción que apunta a agentes_inmobiliarios
ALTER TABLE transacciones_departamentos 
DROP CONSTRAINT IF EXISTS transacciones_departamentos_agente_id_fkey;

-- 3. CREAR NUEVA RESTRICCIÓN CORRECTA
-- Crear la restricción que apunte a administradores
ALTER TABLE transacciones_departamentos 
ADD CONSTRAINT transacciones_departamentos_agente_id_fkey 
FOREIGN KEY (agente_id) REFERENCES administradores(id);

-- 4. VERIFICAR QUE LA RESTRICCIÓN SE CREÓ CORRECTAMENTE
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

-- 5. VERIFICAR QUE LA TABLA ADMINISTRADORES TIENE EL ID 1
SELECT id, nombre, email, es_agente, activo 
FROM administradores 
WHERE id = 1;

-- 6. VERIFICAR QUE NO HAY REFERENCIAS ROTAS
SELECT 
    t.id,
    t.agente_id,
    a.nombre as agente_nombre,
    a.email as agente_email
FROM transacciones_departamentos t
LEFT JOIN administradores a ON t.agente_id = a.id
WHERE a.id IS NULL;

-- 7. ACTUALIZAR REFERENCIAS EN DEPARTAMENTOS (si es necesario)
-- Verificar si hay restricciones en departamentos que también apunten a agentes_inmobiliarios
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
    AND tc.table_name = 'departamentos'
    AND ccu.table_name = 'agentes_inmobiliarios';

-- Si hay restricciones en departamentos, también corregirlas
-- (Esto se ejecutará solo si es necesario)

-- 8. VERIFICAR INTEGRIDAD FINAL
-- Probar que se puede insertar una transacción con agente_id = 1
-- (Este paso es solo para verificación, no se ejecuta realmente)
/*
INSERT INTO transacciones_departamentos (
    departamento_id, agente_id, tipo_transaccion, precio_final
) VALUES (
    1, 1, 'test', 100000
) ON CONFLICT DO NOTHING;

-- Limpiar el registro de prueba
DELETE FROM transacciones_departamentos WHERE departamento_id = 1 AND tipo_transaccion = 'test';
*/
