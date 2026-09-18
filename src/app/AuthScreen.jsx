import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthScreen({ configurationError = '', initialError = '' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(initialError)
  const [notice, setNotice] = useState('')

  async function signIn(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError) {
      setError('Não foi possível entrar. Confira o e-mail, a senha e se o e-mail foi confirmado.')
      setBusy(false)
      return
    }

    const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (assuranceError) {
      await supabase.auth.signOut()
      setError('Não foi possível validar o segundo fator de autenticação.')
      setBusy(false)
      return
    }
    if (assurance.currentLevel === 'aal2' || assurance.nextLevel !== 'aal2') {
      setBusy(false)
      return
    }

    const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors()
    const factor = factors?.totp?.find((item) => item.status === 'verified')
    if (factorError || !factor) {
      await supabase.auth.signOut()
      setError('Esta conta precisa cadastrar o TOTP antes de acessar o sistema.')
      setBusy(false)
      return
    }
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
    if (challengeError) {
      await supabase.auth.signOut()
      setError('Não foi possível iniciar a validação do TOTP.')
      setBusy(false)
      return
    }
    setFactorId(`${factor.id}:${challenge.id}`)
    setNotice('Digite o código de seis dígitos do seu aplicativo autenticador.')
    setBusy(false)
    // Mantemos a sessão AAL1 somente durante a tela de desafio; o banco rejeita AAL1.
    void data.session
  }

  async function verifyMfa(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const [factor, challenge] = factorId.split(':')
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor, challengeId: challenge, code: code.trim() })
    if (verifyError) setError('Código TOTP inválido ou expirado.')
    else setNotice('MFA validado. Carregando seu painel…')
    setBusy(false)
  }

  async function sendRecovery() {
    setError('')
    setNotice('')
    if (!email.trim()) {
      setError('Informe o e-mail da conta master para receber a recuperação.')
      return
    }
    setBusy(true)
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    setBusy(false)
    if (recoveryError) setError('Não foi possível solicitar a recuperação agora.')
    else setNotice('Se o e-mail estiver autorizado, enviaremos as instruções de recuperação.')
  }

  const challengeActive = Boolean(factorId)

  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <div>
          <div className="logo-lockup"><span className="logo-symbol">F</span><span>finesse</span></div>
          <p className="brand-kicker">silver · controle interno</p>
        </div>
        <div className="brand-message">
          <p className="eyebrow">Prata 925, organizada</p>
          <h1>Um olhar claro para cada venda.</h1>
          <p>Controle pedidos, estoque, recebimentos e cobranças da sua loja online em um só lugar.</p>
        </div>
        <span className="brand-footer">Acesso restrito aos dois usuários master</span>
      </section>
      <section className="auth-form-panel">
        <div className="auth-card">
          <span className="eyebrow">Área reservada</span>
          <h2>{challengeActive ? 'Confirme seu acesso' : 'Entrar no sistema'}</h2>
          <p className="auth-help">{challengeActive ? 'Abra seu aplicativo autenticador e informe o código atual.' : 'Use uma das contas master autorizadas para continuar.'}</p>

          {configurationError && <div className="alert warning"><strong>Ambiente ainda não conectado</strong><span>{configurationError}</span></div>}
          {error && <div className="alert error"><strong>Não foi possível continuar</strong><span>{error}</span></div>}
          {notice && <div className="alert success"><strong>Pronto</strong><span>{notice}</span></div>}

          {!configurationError && !challengeActive && <form onSubmit={signIn} className="auth-form">
            <label>E-mail<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu e-mail autorizado" required /></label>
            <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" minLength="12" required /></label>
            <button className="primary-button" disabled={busy}>{busy ? 'Validando…' : 'Entrar com segurança'}</button>
            <button type="button" className="text-button" onClick={sendRecovery} disabled={busy}>Esqueci minha senha</button>
          </form>}

          {!configurationError && challengeActive && <form onSubmit={verifyMfa} className="auth-form">
            <label>Código do autenticador<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" minLength="6" maxLength="6" required /></label>
            <button className="primary-button" disabled={busy || code.length !== 6}>{busy ? 'Verificando…' : 'Confirmar código'}</button>
            <button type="button" className="text-button" onClick={() => { supabase.auth.signOut(); setFactorId(''); setCode(''); setNotice('') }}>Voltar</button>
          </form>}

          <p className="security-note"><span className="shield-icon">◆</span> Sessão protegida por senha, confirmação de e-mail e MFA.</p>
        </div>
      </section>
    </main>
  )
}
