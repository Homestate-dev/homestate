-- Script para eliminar columnas de ambientes y equipamiento de la tabla departamentos
-- Ejecutar en Heroku PostgreSQL

-- Eliminar las columnas de ambientes y equipamiento
ALTER TABLE departamentos DROP COLUMN IF EXISTS amueblado;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_living_comedor;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_cocina_separada;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_antebano;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_bano_completo;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_aire_acondicionado;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_placares;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_cocina_con_horno_y_anafe;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_muebles_bajo_mesada;
ALTER TABLE departamentos DROP COLUMN IF EXISTS tiene_desayunador_madera;

-- Agregar la nueva columna para ambientes y adicionales
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS ambientes_y_adicionales JSONB DEFAULT '[]'::jsonb;

-- Verificar que las columnas se eliminaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
ORDER BY ordinal_position; 