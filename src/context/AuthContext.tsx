import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isDemoMode, supabase } from '../lib/supabase'
import { demoProfiles } from '../services/data'

interface AuthState {
  userId: string | null
  email: string | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  changePassword: (password: string) => Promise<void>
  demoSignIn: (name: 'Raunaq' | 'Vipul') => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const DEMO_USER_KEY = 'run-together:demo-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Pick<User, 'id' | 'email'> | null>(() => {
    if (!isDemoMode) return null
    const profile = demoProfiles.find((item) => item.id === localStorage.getItem(DEMO_USER_KEY))
    return profile ? { id: profile.id, email: profile.email } : null
  })
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode) return
    void supabase!.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false) })
    const { data } = supabase!.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(() => ({
    userId: user?.id ?? null,
    email: user?.email ?? null,
    loading,
    isDemo: isDemoMode,
    signIn: async (email, password) => {
      if (isDemoMode) throw new Error('Use a demo runner to preview the app')
      const { error } = await supabase!.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    changePassword: async (password) => {
      if (isDemoMode) throw new Error('Password changes are unavailable in local preview mode')
      const { error } = await supabase!.auth.updateUser({ password })
      if (error) throw error
    },
    demoSignIn: (name) => {
      const profile = demoProfiles.find((item) => item.displayName === name)!
      localStorage.setItem(DEMO_USER_KEY, profile.id)
      setUser({ id: profile.id, email: profile.email })
    },
    signOut: async () => {
      if (isDemoMode) localStorage.removeItem(DEMO_USER_KEY)
      else await supabase!.auth.signOut()
      setUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Auth and its provider intentionally share one module to keep the context private.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
