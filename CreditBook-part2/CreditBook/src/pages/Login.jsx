import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>CreditBook</h1>
        <p className="muted">Smart Ledger – sign in to your account</p>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
        <p className="muted"><Link to="/forgot">Forgot password?</Link></p>
        <p className="muted">New here? <Link to="/register">Create account</Link></p>
      </form>
    </div>
  )
}
