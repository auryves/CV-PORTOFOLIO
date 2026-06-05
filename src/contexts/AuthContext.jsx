import { createContext, useContext, useState, useEffect } from 'react'
import { DEMO_USERS } from '../lib/mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

const SESSION_KEY = 'ctn_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) loadSupabaseProfile(session.user)
        else setLoading(false)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) loadSupabaseProfile(session.user)
        else { setUser(null); setLoading(false) }
      })
      return () => subscription.unsubscribe()
    } else {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) setUser(JSON.parse(saved))
      setLoading(false)
    }
  }, [])

  async function loadSupabaseProfile(authUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setUser(data ? { ...authUser, ...data } : authUser)
    setLoading(false)
  }

  async function login(email, password) {
    setError(null)
    if (isSupabaseConfigured) {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
    } else {
      const found = DEMO_USERS.find(
        (u) => u.email === email && u.password === password
      )
      if (!found) throw new Error('Email ou mot de passe incorrect')
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    }
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  const isProf = user?.role === 'professeur'
  const isDelegue = user?.role === 'delegue'

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isProf, isDelegue }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
