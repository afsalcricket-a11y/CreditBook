import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [business, setBusiness] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('business_name, phone').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        setBusiness(data.business_name); setPhone(data.phone)
      })
  }, [user.id])

  async function save(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setMsg('')
    const { error } = await supabase.from('profiles')
      .update({ business_name: business.trim(), phone: phone.trim(), theme }).eq('id', user.id)
    setMsg(error ? error.message : 'Saved.')
    setBusy(false)
  }

  return (
    <>
      <form className="card" onSubmit={save}>
        <h2>Business</h2>
        <label>Business name<input required maxLength={100} value={business} onChange={e => setBusiness(e.target.value)} /></label>
        <label>Business phone<input type="tel" maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <label>Currency<input value="INR (₹)" disabled /></label>
        <label>Theme
          <select value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="system">Same as phone</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        {msg && <p className={msg === 'Saved.' ? 'success' : 'error'}>{msg}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
      </form>
      <div className="card">
        <h2>Account</h2>
        <p className="muted">Logged in as {user.email}</p>
        <button className="btn danger" onClick={signOut}>Logout</button>
      </div>
    </>
  )
}
