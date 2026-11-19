/**
 * Tipos generados a partir del esquema de Supabase
 * (equivalente a: npx supabase gen types typescript --project-id <id> > src/types/database.ts).
 * No editar a mano: regenerar cuando cambie la migración.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      instaladores: {
        Row: {
          id: string
          nombre: string
          email: string
          telefono: string | null
          rol: Database['public']['Enums']['rol_usuario']
          activo: boolean
          created_at: string
        }
        Insert: {
          id: string
          nombre: string
          email: string
          telefono?: string | null
          rol?: Database['public']['Enums']['rol_usuario']
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          telefono?: string | null
          rol?: Database['public']['Enums']['rol_usuario']
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      proyectos: {
        Row: {
          id: string
          nombre: string
          cliente: string
          direccion: string
          capacidad_kw: number
          estado: Database['public']['Enums']['estado_proyecto']
          fecha_inicio: string
          fecha_fin_estimada: string
          instalador_id: string | null
          notas: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          cliente: string
          direccion: string
          capacidad_kw: number
          estado?: Database['public']['Enums']['estado_proyecto']
          fecha_inicio: string
          fecha_fin_estimada: string
          instalador_id?: string | null
          notas?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          cliente?: string
          direccion?: string
          capacidad_kw?: number
          estado?: Database['public']['Enums']['estado_proyecto']
          fecha_inicio?: string
          fecha_fin_estimada?: string
          instalador_id?: string | null
          notas?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'proyectos_instalador_id_fkey'
            columns: ['instalador_id']
            isOneToOne: false
            referencedRelation: 'instaladores'
            referencedColumns: ['id']
          },
        ]
      }
      materiales: {
        Row: {
          id: string
          proyecto_id: string
          nombre: string
          tipo: Database['public']['Enums']['tipo_material']
          cantidad: number
          costo_unitario: number
          created_at: string
        }
        Insert: {
          id?: string
          proyecto_id: string
          nombre: string
          tipo?: Database['public']['Enums']['tipo_material']
          cantidad: number
          costo_unitario?: number
          created_at?: string
        }
        Update: {
          id?: string
          proyecto_id?: string
          nombre?: string
          tipo?: Database['public']['Enums']['tipo_material']
          cantidad?: number
          costo_unitario?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'materiales_proyecto_id_fkey'
            columns: ['proyecto_id']
            isOneToOne: false
            referencedRelation: 'proyectos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      resumen_proyectos: {
        Row: {
          id: string
          nombre: string
          cliente: string
          estado: Database['public']['Enums']['estado_proyecto']
          capacidad_kw: number
          fecha_inicio: string
          fecha_fin_estimada: string
          instalador_id: string | null
          instalador_nombre: string | null
          total_materiales: number
          costo_materiales: number
        }
        Relationships: []
      }
    }
    Functions: {
      es_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: {
      rol_usuario: 'admin' | 'instalador'
      estado_proyecto: 'pendiente' | 'en_progreso' | 'completado'
      tipo_material: 'panel' | 'inversor' | 'bateria' | 'estructura' | 'cableado' | 'otro'
    }
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
export type Views<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row']
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]

// Alias de dominio
export type Proyecto = Tables<'proyectos'>
export type ProyectoResumen = Views<'resumen_proyectos'>
export type Instalador = Tables<'instaladores'>
export type Material = Tables<'materiales'>
export type EstadoProyecto = Enums<'estado_proyecto'>
