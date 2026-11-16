import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { inr } from '../lib/format'

export default function Customers() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('customer_balances').select('id,name,phone,balance').order('name')
      .then(({ data, error }) => { if (error) setError(error.message); setList(data || []); setLoading(false) })
  }, [])

  const term = q.trim().toLowerCase()
  const shown = list.filter(c => c.name.toLowerCase().includes(term) || c.phone.includes(term))

  return (
    <>
      <div className="page-title">
        <h2>Customers</h2>
        <Link to="/customers/new" className="btn small">+ Add</Link>
      </div>
      <input placeholder="Search by name or phone…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="card" style={{ marginTop: 12 }}>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && shown.length === 0 && <p className="muted">No customers found.</p>}
        {shown.map(c => (
          <Link key={c.id} to={`/customers/${c.id}`} className="list-item">
            <span>{c.name}<small>{c.phone}</small></span>
            <b className={Number(c.balance) > 0 ? 'orange' : 'green'}>{inr(c.balance)}</b>
          </Link>
        ))}
      </div>
    </>
  )
}
