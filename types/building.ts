export interface Building {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  codigo_postal: string
  telefono: string
  email: string
  sitio_web?: string
  descripcion?: string
  fecha_construccion?: string
  pisos: number
  departamentos_totales: number
  departamentos_disponibles: number
  departamentos_ocupados: number
  departamentos_reservados: number
  departamentos_mantenimiento: number
  amenidades: string[]
  imagenes: string[]
  estado: 'activo' | 'inactivo' | 'mantenimiento'
  fecha_creacion: string
  fecha_actualizacion: string
  permalink: string
  politica_mascotas: string
  tipo_estacionamiento: string
  url_imagen_principal: string
  departamentos_count: number
  disponibles_count: number
} 