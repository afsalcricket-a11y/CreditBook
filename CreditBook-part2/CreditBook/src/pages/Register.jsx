import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [business, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setBusy(true); setError(''); setInfo('')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { business_name: business.trim() } },
    })
    if (error) setError(error.message)
    else if (!data.session) setInfo('Account created. Check your email and click the confirmation link, then login.')
    setBusy(false)
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        <label>Business name<input required maxLength={100} value={business} onChange={e => setBusiness(e.target.value)} /></label>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password (min 8 characters)<input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        {info && <p className="success">{info}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
        <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}
