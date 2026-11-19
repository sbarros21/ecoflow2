import { AuthProvider, useAuth } from '@/features/auth/AuthProvider'
import { LoginPage } from '@/features/auth/LoginPage'
import { Dashboard } from '@/features/proyectos/Dashboard'

function Rutas() {
  const { session, loading } = useAuth()
  if (loading) return <p className="p-10 text-center text-sm text-slate-500">Cargando…</p>
  return session ? <Dashboard /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Rutas />
    </AuthProvider>
  )
}
