import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CustomerForm() {
  const { id } = useParams() // present when editing
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [opening, setOpening] = useState('0')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('customers').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setName(data.name); setPhone(data.phone); setAddress(data.address || ''); setOpening(String(data.opening_balance))
    })
  }, [id])

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setError('')
    if (!/^[+\d][\d\s-]{4,19}$/.test(phone.trim())) return setError('Enter a valid phone number (digits only, 5–20 characters).')
    if (!/^\d+(\.\d{1,2})?$/.test(opening.trim())) return setError('Previous balance must be 0 or more (max 2 decimals).')
    setBusy(true)
    const row = { name: name.trim(), phone: phone.trim(), address: address.trim() || null, opening_balance: Number(opening) }
    const { data, error } = id
      ? await supabase.from('customers').update(row).eq('id', id).select('id').single()
      : await supabase.from('customers').insert(row).select('id').single()
    if (error) { setError(error.message); setBusy(false) }
    else navigate(`/customers/${data.id}`)
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{id ? 'Edit customer' : 'Add customer'}</h2>
      <label>Name<input required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Phone (with country code for WhatsApp, e.g. 919876543210)
        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} />
      </label>
      <label>Address (optional)<input maxLength={300} value={address} onChange={e => setAddress(e.target.value)} /></label>
      <label>Previous balance (₹)
        <input type="number" inputMode="decimal" step="0.01" min="0" value={opening} onChange={e => setOpening(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save customer'}</button>
      <button type="button" className="btn ghost" onClick={() => navigate(-1)}>Cancel</button>
    </form>
  )
}
