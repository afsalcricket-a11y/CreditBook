import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { inr, todayStr } from '../lib/format'

const sum = (list, f) => list.reduce((t, x) => t + (Number(f(x)) || 0), 0)

export default function Dashboard() {
  const [custs, setCusts] = useState([])
  const [today, setToday] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('customer_balances').select('id,name,total_credit,total_paid,balance'),
      supabase.from('transactions').select('type,amount').eq('txn_date', todayStr()),
      supabase.from('transactions').select('id,customer_id,type,amount,description,payment_method,txn_date')
        .order('created_at', { ascending: false }).limit(8),
    ]).then(([a, b, c]) => {
      const err = a.error || b.error || c.error
      if (err) setError(err.message)
      setCusts(a.data || []); setToday(b.data || []); setRecent(c.data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="muted">Loading…</p>
  const name = id => custs.find(c => c.id === id)?.name || 'Customer'

  return (
    <>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <div className="stat"><small>Total customers</small><b>{custs.length}</b></div>
        <div className="stat"><small>Outstanding balance</small><b className="orange">{inr(sum(custs, c => c.balance))}</b></div>
        <div className="stat"><small>Total credit given</small><b className="red">{inr(sum(custs, c => c.total_credit))}</b></div>
        <div className="stat"><small>Payments received</small><b className="green">{inr(sum(custs, c => c.total_paid))}</b></div>
        <div className="stat"><small>Today's credit</small><b className="red">{inr(sum(today.filter(t => t.type === 'credit'), t => t.amount))}</b></div>
        <div className="stat"><small>Today's collections</small><b className="green">{inr(sum(today.filter(t => t.type === 'payment'), t => t.amount))}</b></div>
      </div>
      <div className="btn-row">
        <Link to="/credit" className="btn small" style={{ background: 'var(--red)', color: '#fff', textAlign: 'center' }}>+ Give credit</Link>
        <Link to="/payment" className="btn small" style={{ color: '#fff', textAlign: 'center' }}>+ Receive payment</Link>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Recent transactions</h2>
        {recent.length === 0 && <p className="muted">No transactions yet.</p>}
        {recent.map(t => (
          <Link key={t.id} to={`/customers/${t.customer_id}`} className="list-item">
            <span>{name(t.customer_id)}<small>{t.txn_date} · {t.type === 'payment' ? t.payment_method : t.description || 'Credit'}</small></span>
            <b className={t.type === 'payment' ? 'green' : 'red'}>{t.type === 'payment' ? '+' : '−'}{inr(t.amount)}</b>
          </Link>
        ))}
      </div>
    </>
  )
}
