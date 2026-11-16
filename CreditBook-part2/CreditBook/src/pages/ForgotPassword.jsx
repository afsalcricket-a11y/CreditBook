import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setInfo('')
    const redirectTo = window.location.origin + import.meta.env.BASE_URL + '#/reset'
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    if (error) setError(error.message)
    else setInfo('If this email has an account, a reset link has been sent.')
    setBusy(false)
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Forgot password</h1>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        {info && <p className="success">{info}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        <p className="muted"><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  )
}
