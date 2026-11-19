import { z } from 'zod'

/**
 * Validación del formulario de proyecto. Replica las restricciones CHECK de la
 * base de datos para dar feedback inmediato; la base de datos sigue siendo la
 * última barrera (defensa en profundidad).
 */
export const proyectoSchema = z
  .object({
    nombre: z.string().trim().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
    cliente: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    direccion: z.string().trim().min(5, 'Ingresa una dirección válida'),
    capacidad_kw: z.coerce
      .number({ error: 'Debe ser un número' })
      .positive('Debe ser mayor que 0')
      .max(10000, 'Máximo 10.000 kW'),
    estado: z.enum(['pendiente', 'en_progreso', 'completado']),
    fecha_inicio: z.iso.date('Fecha inválida'),
    fecha_fin_estimada: z.iso.date('Fecha inválida'),
    instalador_id: z.uuid('Selecciona un instalador'),
    notas: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
  })
  .refine((d) => d.fecha_fin_estimada >= d.fecha_inicio, {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['fecha_fin_estimada'],
  })

export type ProyectoFormInput = z.input<typeof proyectoSchema>
export type ProyectoFormData = z.output<typeof proyectoSchema>
export type ProyectoFormErrors = Partial<Record<keyof ProyectoFormInput, string>>

export function validarProyecto(input: ProyectoFormInput) {
  const result = proyectoSchema.safeParse(input)
  if (result.success) return { data: result.data, errors: null }
  const errors: ProyectoFormErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProyectoFormInput
    if (key && !errors[key]) errors[key] = issue.message
  }
  return { data: null, errors }
}
