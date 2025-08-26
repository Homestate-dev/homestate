-- Script para eliminar la restricción UNIQUE que impide múltiples transacciones del mismo tipo

-- Eliminar la restricción UNIQUE en transacciones_ventas_arriendos
DO $$ 
BEGIN
    -- Buscar el nombre de la restricción UNIQUE
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'transacciones_ventas_arriendos' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%departamento_id%'
    ) THEN
        -- Eliminar la restricción usando el nombre encontrado
        EXECUTE (
            SELECT 'ALTER TABLE transacciones_ventas_arriendos DROP CONSTRAINT ' || constraint_name || ';'
            FROM information_schema.table_constraints 
            WHERE table_name = 'transacciones_ventas_arriendos' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%departamento_id%'
            LIMIT 1
        );
        
        RAISE NOTICE '✅ Restricción UNIQUE eliminada exitosamente';
    ELSE
        RAISE NOTICE '⚠️ No se encontró restricción UNIQUE para eliminar';
    END IF;
END $$;
