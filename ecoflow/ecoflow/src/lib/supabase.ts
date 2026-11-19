import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env')
}

/**
 * Cliente único y tipado. Solo usa la anon key: cada petición viaja con el JWT
 * del usuario y Postgres aplica las políticas RLS. Nunca usar la service_role
 * key en el frontend.
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
