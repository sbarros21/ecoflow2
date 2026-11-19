import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { mensajeError } from '@/lib/utils'
import type { ProyectoFormData } from '@/lib/validations'
import type { EstadoProyecto, ProyectoResumen } from '@/types/database'

type Resultado = { ok: true } | { ok: false; error: string }

/**
 * Proyectos visibles para el usuario actual. No filtra por instalador en el
 * cliente: RLS ya devuelve solo los asignados (o todos si es admin).
 * Lee de la vista resumen_proyectos (security_invoker) y escucha la tabla
 * proyectos en tiempo real.
 */
export function useProyectos() {
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cargar = useCallback(async () => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const { data, error } = await supabase
      .from('resumen_proyectos')
      .select('*')
      .order('fecha_inicio', { ascending: false })
      .abortSignal(ctrl.signal)

    if (ctrl.signal.aborted) return
    if (error) setError(mensajeError(error))
    else {
      setProyectos(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // cargar() solo actualiza estado después de un await (respuesta de red).
    // oxlint-disable-next-line react/set-state-in-effect
    void cargar()

    // La vista agrega datos (materiales, costos), así que ante cualquier cambio
    // se recarga; un debounce agrupa ráfagas de eventos en una sola consulta.
    let timer: ReturnType<typeof setTimeout> | undefined
    const channel = supabase
      .channel(`proyectos-dashboard-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, () => {
        clearTimeout(timer)
        timer = setTimeout(() => void cargar(), 300)
      })
      .subscribe()

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
      void supabase.removeChannel(channel)
    }
  }, [cargar])

  const crearProyecto = useCallback(
    async (datos: ProyectoFormData): Promise<Resultado> => {
      const { error } = await supabase.from('proyectos').insert({
        ...datos,
        notas: datos.notas || null,
      })
      if (error) return { ok: false, error: mensajeError(error) }
      await cargar()
      return { ok: true }
    },
    [cargar],
  )

  /** Cambio de estado con actualización optimista y rollback si falla. */
  const cambiarEstado = useCallback(
    async (id: string, estado: EstadoProyecto): Promise<Resultado> => {
      let anterior: EstadoProyecto | undefined
      setProyectos((ps) =>
        ps.map((p) => {
          if (p.id !== id) return p
          anterior = p.estado
          return { ...p, estado }
        }),
      )

      const { data, error } = await supabase.from('proyectos').update({ estado }).eq('id', id).select('id')

      // Con RLS, un UPDATE no permitido no lanza error: afecta 0 filas.
      if (error || !data?.length) {
        if (anterior) {
          const prev = anterior
          setProyectos((ps) => ps.map((p) => (p.id === id ? { ...p, estado: prev } : p)))
        }
        return { ok: false, error: error ? mensajeError(error) : 'No tienes permiso sobre este proyecto.' }
      }
      return { ok: true }
    },
    [],
  )

  return { proyectos, loading, error, recargar: cargar, crearProyecto, cambiarEstado }
}
