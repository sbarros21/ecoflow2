import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/input'
import { ESTADOS, estadoLabel, formatCOP, formatFecha } from '@/lib/utils'
import type { EstadoProyecto, ProyectoResumen } from '@/types/database'

interface Props {
  proyectos: ProyectoResumen[]
  esAdmin: boolean
  onCambiarEstado: (id: string, estado: EstadoProyecto) => void
}

export function ProyectosTable({ proyectos, esAdmin, onCambiarEstado }: Props) {
  if (proyectos.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No hay proyectos para mostrar.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Proyecto</th>
            <th className="px-4 py-3 font-medium">Capacidad</th>
            <th className="px-4 py-3 font-medium">Fechas</th>
            {esAdmin && <th className="px-4 py-3 font-medium">Instalador</th>}
            <th className="px-4 py-3 font-medium">Materiales</th>
            <th className="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proyectos.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-medium">{p.nombre}</p>
                <p className="text-xs text-slate-500">{p.cliente}</p>
              </td>
              <td className="px-4 py-3">{Number(p.capacidad_kw).toLocaleString('es-CO')} kW</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {formatFecha(p.fecha_inicio)} → {formatFecha(p.fecha_fin_estimada)}
              </td>
              {esAdmin && <td className="px-4 py-3">{p.instalador_nombre ?? <span className="text-slate-400">Sin asignar</span>}</td>}
              <td className="px-4 py-3 text-xs">
                {p.total_materiales} {p.total_materiales === 1 ? "ítem" : "ítems"}
                <br />
                <span className="text-slate-500">{formatCOP(Number(p.costo_materiales))}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant={p.estado}>{estadoLabel(p.estado)}</Badge>
                  <Select
                    aria-label={`Cambiar estado de ${p.nombre}`}
                    className="h-8 w-36 py-1 text-xs"
                    value={p.estado}
                    onChange={(e) => onCambiarEstado(p.id, e.target.value as EstadoProyecto)}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
