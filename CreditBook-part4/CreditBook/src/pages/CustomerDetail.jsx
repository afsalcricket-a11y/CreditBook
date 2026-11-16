import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { inr } from '../lib/format'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [c, setC] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('customer_balances').select('*').eq('id', id).maybeSingle()
      .then(({ data, error }) => { if (error) setError(error.message); setC(data) })
  }, [id])

  async function remove() {
    if (busy) return
    if (!window.confirm(`Delete ${c.name}? All of this customer's credit and payment entries will also be deleted. This cannot be undone.`)) return
    setBusy(true)
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) { setError(error.message); setBusy(false) } else navigate('/customers')
  }

  if (error) return <p className="error">{error}</p>
  if (!c) return <p className="muted">Loading…</p>

  return (
    <>
      <div className="card">
        <h2>{c.name}</h2>
        <p className="muted">📞 {c.phone}{c.address ? ` · 📍 ${c.address}` : ''}</p>
        <p className="muted" style={{ marginBottom: 0 }}>Outstanding balance</p>
        <h1 className={Number(c.balance) > 0 ? 'orange' : 'green'} style={{ margin: '4px 0' }}>{inr(c.balance)}</h1>
        <p className="muted">Previous {inr(c.opening_balance)} · Credit {inr(c.total_credit)} · Paid {inr(c.total_paid)}</p>
      </div>
      <div className="btn-row">
        <Link to={`/credit?c=${id}`} className="btn small" style={{ background: 'var(--red)', color: '#fff', textAlign: 'center' }}>+ Give credit</Link>
        <Link to={`/payment?c=${id}`} className="btn small" style={{ color: '#fff', textAlign: 'center' }}>+ Receive payment</Link>
      </div>
      <Link to={`/customers/${id}/ledger`} className="btn small ghost" style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>View ledger &amp; share on WhatsApp</Link>
      <div className="btn-row" style={{ marginTop: 10 }}>
        <Link to={`/customers/${id}/edit`} className="btn small ghost" style={{ textAlign: 'center' }}>Edit</Link>
        <button className="btn small danger" onClick={remove} disabled={busy}>Delete</button>
      </div>
    </>
  )
}
