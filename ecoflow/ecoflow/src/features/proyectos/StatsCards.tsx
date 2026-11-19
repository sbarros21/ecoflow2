import { CheckCircle2, Clock, Loader, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ProyectoResumen } from '@/types/database'

export function StatsCards({ proyectos }: { proyectos: ProyectoResumen[] }) {
  const cuenta = (e: ProyectoResumen['estado']) => proyectos.filter((p) => p.estado === e).length
  const kwTotal = proyectos.reduce((acc, p) => acc + Number(p.capacidad_kw), 0)

  const items = [
    { label: 'Pendientes', valor: cuenta('pendiente'), icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'En progreso', valor: cuenta('en_progreso'), icon: Loader, color: 'text-sky-600 bg-sky-50' },
    { label: 'Completados', valor: cuenta('completado'), icon: CheckCircle2, color: 'text-brand-700 bg-brand-50' },
    { label: 'Capacidad total', valor: `${kwTotal.toLocaleString('es-CO')} kW`, icon: Zap, color: 'text-violet-600 bg-violet-50' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ label, valor, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-semibold">{valor}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
