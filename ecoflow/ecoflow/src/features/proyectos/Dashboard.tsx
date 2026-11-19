import { useMemo, useState } from 'react'
import { LogOut, Plus, Sun } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { useProyectos } from '@/hooks/useProyectos'
import { ESTADOS } from '@/lib/utils'
import type { EstadoProyecto } from '@/types/database'
import { ProyectoForm } from './ProyectoForm'
import { ProyectosTable } from './ProyectosTable'
import { StatsCards } from './StatsCards'

export function Dashboard() {
  const { perfil, esAdmin, signOut } = useAuth()
  const { proyectos, loading, error, crearProyecto, cambiarEstado } = useProyectos()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<EstadoProyecto | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'success'; texto: string } | null>(null)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return proyectos.filter(
      (p) =>
        (filtroEstado === 'todos' || p.estado === filtroEstado) &&
        (!q || p.nombre.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q)),
    )
  }, [proyectos, filtroEstado, busqueda])

  async function handleCambiarEstado(id: string, estado: EstadoProyecto) {
    const res = await cambiarEstado(id, estado)
    setAviso(res.ok ? null : { tipo: 'error', texto: res.error })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <Sun className="h-5 w-5 text-brand-600" /> EcoFlow
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">
              {perfil?.nombre} · <span className="capitalize">{perfil?.rol}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Proyectos</h1>
            <p className="text-sm text-slate-500">
              {esAdmin ? 'Todos los proyectos de la empresa' : 'Proyectos asignados a ti'}
            </p>
          </div>
          {esAdmin && !mostrarForm && (
            <Button onClick={() => setMostrarForm(true)}>
              <Plus className="h-4 w-4" /> Nuevo proyecto
            </Button>
          )}
        </div>

        {aviso && <Alert variant={aviso.tipo}>{aviso.texto}</Alert>}
        {error && <Alert>{error}</Alert>}

        {esAdmin && mostrarForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nuevo proyecto</CardTitle>
              <CardDescription>Los campos se validan antes de enviarse a Supabase.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProyectoForm
                onCancel={() => setMostrarForm(false)}
                onSubmit={async (datos) => {
                  const res = await crearProyecto(datos)
                  if (res.ok) {
                    setMostrarForm(false)
                    setAviso({ tipo: 'success', texto: 'Proyecto creado correctamente.' })
                  }
                  return res
                }}
              />
            </CardContent>
          </Card>
        )}

        <StatsCards proyectos={proyectos} />

        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>Estado de los proyectos</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Buscar proyecto o cliente" className="w-56" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <Select className="w-40" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoProyecto | 'todos')}>
                <option value="todos">Todos</option>
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Cargando proyectos…</p>
            ) : (
              <ProyectosTable proyectos={filtrados} esAdmin={esAdmin} onCambiarEstado={handleCambiarEstado} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
