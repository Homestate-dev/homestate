-- Script para crear datos de ejemplo para probar el sistema de departamentos

-- Insertar edificios de ejemplo
INSERT INTO edificios (nombre, direccion, permalink, costo_expensas, descripcion, creado_por)
VALUES 
  ('Torre Empresarial', 'Carrera 11 #93-50, Bogotá', 'torre-empresarial', 380000, 'Moderno edificio empresarial en zona norte', 'system'),
  ('Residencias del Parque', 'Calle 72 #10-20, Bogotá', 'residencias-del-parque', 420000, 'Exclusivo conjunto residencial con zonas verdes', 'system'),
  ('Centro Comercial Plaza', 'Avenida 15 #85-30, Bogotá', 'centro-comercial-plaza', 500000, 'Ubicación estratégica en zona comercial', 'system')
ON CONFLICT (permalink) DO NOTHING;

-- Insertar departamentos de ejemplo
INSERT INTO departamentos (
  edificio_id, numero, nombre, piso, area, valor_arriendo, valor_venta, 
  disponible, cantidad_habitaciones, tipo, estado, ideal_para, creado_por
)
SELECT 
  e.id,
  d.numero,
  d.nombre,
  d.piso,
  d.area,
  d.valor_arriendo,
  d.valor_venta,
  d.disponible,
  d.cantidad_habitaciones,
  d.tipo,
  d.estado,
  d.ideal_para,
  'system'
FROM edificios e
CROSS JOIN (VALUES
  -- Torre Empresarial
  ('101', 'Oficina Ejecutiva Norte', 1, 45.5, 2800000, 180000000, true, '2 espacios', 'arriendo y venta', 'nuevo', 'profesional'),
  ('102', 'Suite Empresarial Central', 1, 68.2, 4200000, 280000000, true, '3 espacios', 'arriendo y venta', 'nuevo', 'profesional'),
  ('201', 'Oficina Premium Vista Norte', 2, 52.8, 3200000, 220000000, true, '2 espacios', 'arriendo y venta', 'nuevo', 'profesional'),
  ('202', 'Sala de Juntas Ejecutiva', 2, 35.0, 2100000, 150000000, true, '1 espacio', 'arriendo', 'nuevo', 'profesional'),
  ('301', 'Penthouse Empresarial', 3, 95.5, 6800000, 450000000, true, '4 espacios', 'venta', 'nuevo', 'profesional'),
  
  -- Residencias del Parque  
  ('101', 'Apartamento Familiar Sur', 1, 78.5, 2200000, 320000000, true, '3 habitaciones', 'arriendo y venta', 'nuevo', 'familia'),
  ('102', 'Estudio Moderno', 1, 42.0, 1400000, 180000000, true, '1 habitación', 'arriendo y venta', 'nuevo', 'persona_sola'),
  ('201', 'Apartamento Vista Parque', 2, 85.2, 2600000, 380000000, true, '3 habitaciones', 'arriendo y venta', 'nuevo', 'familia'),
  ('202', 'Loft Contemporáneo', 2, 55.8, 1800000, 250000000, true, '2 habitaciones', 'arriendo y venta', 'nuevo', 'pareja'),
  ('301', 'Penthouse con Terraza', 3, 120.0, 4500000, 650000000, true, '4 habitaciones', 'venta', 'nuevo', 'familia'),
  
  -- Centro Comercial Plaza
  ('L101', 'Local Comercial Esquinero', 1, 65.0, 3500000, 280000000, true, '2 espacios', 'arriendo y venta', 'nuevo', 'profesional'),
  ('L102', 'Oficina Comercial Central', 1, 48.5, 2800000, 190000000, true, '2 espacios', 'arriendo y venta', 'nuevo', 'profesional'),
  ('L201', 'Suite Comercial Premium', 2, 88.0, 4800000, 350000000, true, '3 espacios', 'arriendo y venta', 'nuevo', 'profesional'),
  ('L202', 'Espacio Coworking', 2, 72.5, 3200000, 240000000, true, '3 espacios', 'arriendo', 'nuevo', 'profesional')
) AS d(numero, nombre, piso, area, valor_arriendo, valor_venta, disponible, cantidad_habitaciones, tipo, estado, ideal_para)
WHERE (
  (e.nombre = 'Torre Empresarial' AND d.numero IN ('101', '102', '201', '202', '301')) OR
  (e.nombre = 'Residencias del Parque' AND d.numero IN ('101', '102', '201', '202', '301')) OR
  (e.nombre = 'Centro Comercial Plaza' AND d.numero LIKE 'L%')
)
ON CONFLICT (edificio_id, numero) DO NOTHING;

-- Verificar datos insertados
SELECT 
  e.nombre as edificio,
  COUNT(d.id) as total_departamentos,
  COUNT(CASE WHEN d.disponible THEN 1 END) as disponibles
FROM edificios e
LEFT JOIN departamentos d ON e.id = d.edificio_id
GROUP BY e.id, e.nombre
ORDER BY e.nombre; 