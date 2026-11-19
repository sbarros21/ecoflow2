import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Instalador } from '@/types/database'

interface AuthContextValue {
  session: Session | null
  perfil: Instalador | null
  esAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  // Perfil cargado junto con el id del usuario al que pertenece
  const [perfilCargado, setPerfilCargado] = useState<{ userId: string; perfil: Instalador | null } | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)

  // 1) Sesión: lectura inicial + escucha de cambios (login, logout, refresh de token)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoadingSession(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // No se llama a Supabase dentro de este callback (puede bloquear el cliente);
      // el perfil se carga en el efecto de abajo.
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // 2) Perfil (rol) del usuario autenticado. RLS solo deja leer el propio.
  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let cancelado = false
    supabase
      .from('instaladores')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (!cancelado) setPerfilCargado({ userId, perfil: data })
      })
    return () => {
      cancelado = true
    }
  }, [userId])

  // Derivado en render: si el perfil guardado es de otro usuario (o no hay sesión), no se usa.
  const perfil = userId && perfilCargado?.userId === userId ? perfilCargado.perfil : null
  const loadingPerfil = !!userId && perfilCargado?.userId !== userId

  const value: AuthContextValue = {
    session,
    perfil,
    esAdmin: perfil?.rol === 'admin',
    loading: loadingSession || loadingPerfil,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? 'Correo o contraseña incorrectos' : null
    },
    async signOut() {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
