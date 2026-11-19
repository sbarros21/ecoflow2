import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { mensajeError } from '@/lib/utils'
import type { Instalador } from '@/types/database'

/** Lista de instaladores activos para asignar proyectos (RLS: solo admin ve todos). */
export function useInstaladores(enabled: boolean) {
  const [instaladores, setInstaladores] = useState<Instalador[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelado = false
    supabase
      .from('instaladores')
      .select('*')
      .eq('activo', true)
      .eq('rol', 'instalador')
      .order('nombre')
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) setError(mensajeError(error))
        else setInstaladores(data ?? [])
        setLoading(false)
      })
    return () => {
      cancelado = true
    }
  }, [enabled])

  return { instaladores, loading, error }
}
