import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInstaladores } from '@/hooks/useInstaladores'
import { ESTADOS } from '@/lib/utils'
import { validarProyecto, type ProyectoFormData, type ProyectoFormErrors, type ProyectoFormInput } from '@/lib/validations'

const VACIO: ProyectoFormInput = {
  nombre: '',
  cliente: '',
  direccion: '',
  capacidad_kw: '',
  estado: 'pendiente',
  fecha_inicio: '',
  fecha_fin_estimada: '',
  instalador_id: '',
  notas: '',
}

interface Props {
  onSubmit: (datos: ProyectoFormData) => Promise<{ ok: true } | { ok: false; error: string }>
  onCancel: () => void
}

export function ProyectoForm({ onSubmit, onCancel }: Props) {
  const { instaladores, loading: cargandoInstaladores } = useInstaladores(true)
  const [form, setForm] = useState<ProyectoFormInput>(VACIO)
  const [errores, setErrores] = useState<ProyectoFormErrors>({})
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrores((er) => ({ ...er, [name]: undefined })) // limpia el error del campo editado
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorServidor(null)

    // 1) Validación en el cliente antes de llamar a Supabase
    const { data, errors } = validarProyecto(form)
    if (!data) {
      setErrores(errors)
      return
    }

    // 2) Envío; la base de datos vuelve a validar (CHECK + RLS)
    setEnviando(true)
    const res = await onSubmit(data)
    setEnviando(false)
    if (!res.ok) setErrorServidor(res.error)
    else setForm(VACIO)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      {errorServidor && <Alert className="sm:col-span-2">{errorServidor}</Alert>}

      <Campo id="nombre" label="Nombre del proyecto" error={errores.nombre}>
        <Input id="nombre" name="nombre" value={form.nombre} onChange={onChange} aria-invalid={!!errores.nombre} />
      </Campo>
      <Campo id="cliente" label="Cliente" error={errores.cliente}>
        <Input id="cliente" name="cliente" value={form.cliente} onChange={onChange} aria-invalid={!!errores.cliente} />
      </Campo>
      <Campo id="direccion" label="Dirección" error={errores.direccion} className="sm:col-span-2">
        <Input id="direccion" name="direccion" value={form.direccion} onChange={onChange} aria-invalid={!!errores.direccion} />
      </Campo>
      <Campo id="capacidad_kw" label="Capacidad (kW)" error={errores.capacidad_kw}>
        <Input
          id="capacidad_kw"
          name="capacidad_kw"
          type="number"
          step="0.01"
          min="0"
          value={String(form.capacidad_kw ?? '')}
          onChange={onChange}
          aria-invalid={!!errores.capacidad_kw}
        />
      </Campo>
      <Campo id="estado" label="Estado inicial" error={errores.estado}>
        <Select id="estado" name="estado" value={form.estado} onChange={onChange}>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </Select>
      </Campo>
      <Campo id="fecha_inicio" label="Fecha de inicio" error={errores.fecha_inicio}>
        <Input id="fecha_inicio" name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={onChange} aria-invalid={!!errores.fecha_inicio} />
      </Campo>
      <Campo id="fecha_fin_estimada" label="Fecha fin estimada" error={errores.fecha_fin_estimada}>
        <Input
          id="fecha_fin_estimada"
          name="fecha_fin_estimada"
          type="date"
          value={form.fecha_fin_estimada}
          onChange={onChange}
          aria-invalid={!!errores.fecha_fin_estimada}
        />
      </Campo>
      <Campo id="instalador_id" label="Instalador asignado" error={errores.instalador_id} className="sm:col-span-2">
        <Select id="instalador_id" name="instalador_id" value={form.instalador_id} onChange={onChange} aria-invalid={!!errores.instalador_id}>
          <option value="">{cargandoInstaladores ? 'Cargando…' : 'Selecciona un instalador'}</option>
          {instaladores.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </Select>
      </Campo>
      <Campo id="notas" label="Notas (opcional)" error={errores.notas} className="sm:col-span-2">
        <Textarea id="notas" name="notas" value={form.notas} onChange={onChange} />
      </Campo>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  )
}

function Campo({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
