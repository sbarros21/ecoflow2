import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EstadoProyecto } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ESTADOS: { value: EstadoProyecto; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completado', label: 'Completado' },
]

export const estadoLabel = (e: EstadoProyecto) => ESTADOS.find((x) => x.value === e)?.label ?? e

export const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${iso}T00:00:00`))

/** Traduce errores de Postgres/PostgREST a mensajes para el usuario. */
export function mensajeError(err: { code?: string; message: string } | null | undefined): string {
  if (!err) return 'Error desconocido'
  switch (err.code) {
    case '42501':
      return 'No tienes permiso para realizar esta acción.'
    case '23514':
      return 'Los datos no cumplen las reglas del sistema (revisa fechas y capacidad).'
    case 'P0001':
      return err.message
    case 'PGRST116':
      return 'El registro no existe o no tienes acceso a él.'
    default:
      return err.message
  }
}
