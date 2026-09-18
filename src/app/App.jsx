import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured, configurationMessage } from '../lib/supabase'
import { AuthScreen } from './AuthScreen'
import { Dashboard } from './Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    async function gateSession(nextSession) {
      if (!nextSession) {
        if (active) setSession(null)
        return
      }
      const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (!active) return
      if (error) {
        setAuthError('Não foi possível validar o segundo fator de autenticação.')
        setSession(null)
        return
      }
      const requiresMfa = assurance.currentLevel !== 'aal2' && assurance.nextLevel === 'aal2'
      // A sessão AAL1 permanece invisível para o restante da aplicação durante o desafio.
      setSession(requiresMfa ? null : nextSession)
    }

    async function hydrate() {
      const { data, error } = await supabase.auth.getSession()
      if (!active) return
      if (error) setAuthError(error.message)
      await gateSession(data.session)
      if (active) setLoading(false)
    }
    hydrate()

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Evita executar outra chamada Auth dentro do callback síncrono do Supabase.
      window.setTimeout(() => gateSession(nextSession).finally(() => active && setLoading(false)), 0)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const configIssue = useMemo(() => !isSupabaseConfigured, [])

  if (loading) return <div className="loading-screen"><span className="brand-mark">F</span><p>Carregando Finesse Silver…</p></div>
  if (configIssue) return <AuthScreen configurationError={configurationMessage()} />
  if (!session) return <AuthScreen initialError={authError} />
  return <Dashboard session={session} />
}
