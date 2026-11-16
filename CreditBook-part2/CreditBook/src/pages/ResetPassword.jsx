import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setBusy(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setBusy(false) }
    else navigate('/')
  }

  if (loading) return <div className="center">Loading…</div>
  if (!session)
    return (
      <div className="auth-page"><div className="card auth-card">
        <p>This reset link is invalid or has expired.</p>
        <Link to="/forgot">Request a new link</Link>
      </div></div>
    )

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Set new password</h1>
        <label>New password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </div>
  )
}
