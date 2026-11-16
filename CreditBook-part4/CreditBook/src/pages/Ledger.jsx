import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchAll } from '../lib/fetchAll'
import { downloadCsv } from '../lib/csv'
import { waLink } from '../lib/whatsapp'
import { inr, todayStr } from '../lib/format'

const r2 = x => Math.round(x * 100) / 100

export default function Ledger() {
  const { id } = useParams()
  const [cust, setCust] = useState(null)
  const [txs, setTxs] = useState([])
  const [biz, setBiz] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const c = await supabase.from('customer_balances').select('*').eq('id', id).maybeSingle()
        if (c.error) throw c.error
        setCust(c.data)
        setTxs(await fetchAll(() => supabase.from('transactions')
          .select('id,type,amount,description,payment_method,txn_date,notes')
          .eq('customer_id', id).order('txn_date').order('created_at').order('id')))
        const p = await supabase.from('profiles').select('business_name').maybeSingle()
        setBiz(p.data?.business_name || 'our shop')
      } catch (e) { setError(e.message) }
      setLoading(false)
    })()
  }, [id])

  const { rows, prev, shown } = useMemo(() => {
    if (!cust) return { rows: [], prev: 0, shown: [] }
    let bal = Number(cust.opening_balance)
    const rows = txs.map(t => {
      bal = r2(bal + (t.type === 'credit' ? 1 : -1) * Number(t.amount))
      return { ...t, balance: bal }
    })
    let prev = Number(cust.opening_balance)
    if (from) rows.forEach(r => { if (r.txn_date < from) prev = r.balance })
    const shown = rows.filter(r => (!from || r.txn_date >= from) && (!to || r.txn_date <= to))
    return { rows, prev, shown }
  }, [cust, txs, from, to])

  if (loading) return <p className="muted">Loading…</p>
  if (error) return <p className="error">{error}</p>
  if (!cust) return <p className="muted">Customer not found.</p>

  const balance = Number(cust.balance)
  const credit = shown.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
  const paid = shown.filter(t => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0)

  const msgBalance = `Hello ${cust.name}, your outstanding balance with ${biz} is ${inr(balance)} as of ${todayStr()}. Thank you.`
  const msgReminder = `Dear ${cust.name}, this is a friendly reminder that ${inr(balance)} is pending at ${biz}. Please pay at your earliest convenience. Thank you.`
  const last = shown.slice(-10).map(t =>
    `${t.txn_date}: ${t.type === 'credit' ? 'Credit' : 'Paid'} ${inr(t.amount)}${t.description ? ' (' + t.description + ')' : ''}`).join('\n')
  const msgSummary = `Account summary - ${biz}\nCustomer: ${cust.name}\n${last || 'No transactions'}\nBalance: ${inr(balance)}`

  function exportCsv() {
    downloadCsv(`ledger-${cust.name.replace(/[^a-z0-9]+/gi, '-')}.csv`,
      ['Date', 'Description', 'Method', 'Credit', 'Payment', 'Balance'],
      [['', 'Previous balance', '', '', '', prev], ...shown.map(t => [t.txn_date, t.description || '', t.payment_method || '',
        t.type === 'credit' ? t.amount : '', t.type === 'payment' ? t.amount : '', t.balance])])
  }

  return (
    <>
      <div className="card">
        <Link to={`/customers/${id}`}>← {cust.name}</Link>
        <h2 style={{ marginTop: 8 }}>Ledger</h2>
        <div className="filters">
          <label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label>To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        </div>
        <div className="totals">
          <div>Credit<b className="red">{inr(credit)}</b></div>
          <div>Paid<b className="green">{inr(paid)}</b></div>
          <div>Balance<b className="orange">{inr(balance)}</b></div>
        </div>
        <div className="tx"><span><b>Previous balance</b></span><b>{inr(prev)}</b></div>
        {shown.length === 0 && <p className="muted">No transactions in this period.</p>}
        {shown.map(t => (
          <div key={t.id} className="tx">
            <span>{t.description || (t.type === 'credit' ? 'Credit' : 'Payment')}
              <small>{t.txn_date}{t.payment_method ? ` · ${t.payment_method}` : ''}{t.notes ? ` · ${t.notes}` : ''}</small></span>
            <span className="right">
              <b className={t.type === 'credit' ? 'red' : 'green'}>{t.type === 'credit' ? '+' : '−'}{inr(t.amount)}</b>
              <small>Bal {inr(t.balance)}</small>
            </span>
          </div>
        ))}
        <button className="btn ghost" onClick={exportCsv} style={{ marginTop: 12 }}>Download CSV</button>
      </div>
      <div className="card">
        <h2>Share on WhatsApp</h2>
        <a className="btn wa" target="_blank" rel="noopener noreferrer" href={waLink(cust.phone, msgBalance)}>Share outstanding balance</a>
        <a className={`btn wa ${balance > 0 ? '' : 'off'}`} target="_blank" rel="noopener noreferrer" href={waLink(cust.phone, msgReminder)}>Send payment reminder</a>
        <a className="btn wa" target="_blank" rel="noopener noreferrer" href={waLink(cust.phone, msgSummary)}>Share transaction summary</a>
        {balance <= 0 && <p className="muted">Reminder is off because nothing is pending.</p>}
      </div>
    </>
  )
}
