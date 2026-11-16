import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchAll } from '../lib/fetchAll'
import { downloadCsv } from '../lib/csv'
import { inr, todayStr } from '../lib/format'

const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d + n).toLocaleDateString('en-CA') }
const PRESETS = {
  today: () => [todayStr(), todayStr()],
  week: () => [addDays(todayStr(), -6), todayStr()],
  month: () => [todayStr().slice(0, 8) + '01', todayStr()],
  all: () => ['', ''],
}
const sum = (l, f = x => x.amount) => l.reduce((s, x) => s + Number(f(x)), 0)

export default function Reports() {
  const [type, setType] = useState('summary')
  const [preset, setPreset] = useState('today')
  const [[from, to], setRange] = useState(PRESETS.today())
  const [txs, setTxs] = useState([])
  const [custs, setCusts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const c = await supabase.from('customer_balances').select('id,name,phone,balance').order('name')
        if (c.error) throw c.error
        setCusts(c.data)
        setTxs(await fetchAll(() => {
          let q = supabase.from('transactions')
            .select('id,customer_id,type,amount,description,payment_method,txn_date,notes')
            .order('txn_date', { ascending: false }).order('created_at', { ascending: false }).order('id')
          if (from) q = q.gte('txn_date', from)
          if (to) q = q.lte('txn_date', to)
          return q
        }))
        setError('')
      } catch (e) { setError(e.message) }
      setLoading(false)
    })()
  }, [from, to])

  const name = id => custs.find(c => c.id === id)?.name || ''
  const credits = txs.filter(t => t.type === 'credit')
  const pays = txs.filter(t => t.type === 'payment')
  const list = type === 'credit' ? credits : type === 'payment' ? pays : txs
  const owing = custs.filter(c => Number(c.balance) > 0)

  function pick(p) {
    setPreset(p)
    if (p !== 'custom') setRange(PRESETS[p]())
  }

  function exportCsv() {
    if (type === 'outstanding') {
      return downloadCsv('outstanding-report.csv', ['Customer', 'Phone', 'Outstanding'],
        owing.map(c => [c.name, c.phone, c.balance]))
    }
    downloadCsv(`${type}-report-${from || 'start'}-to-${to || 'today'}.csv`,
      ['Date', 'Customer', 'Type', 'Amount', 'Method', 'Description', 'Notes'],
      list.map(t => [t.txn_date, name(t.customer_id), t.type, t.amount, t.payment_method || '', t.description || '', t.notes || '']))
  }

  return (
    <div className="card">
      <h2>Reports</h2>
      <label>Report
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="summary">Summary (credit + payments)</option>
          <option value="credit">Total credit report</option>
          <option value="payment">Total payment report</option>
          <option value="outstanding">Outstanding balance report</option>
        </select>
      </label>
      {type !== 'outstanding' && (
        <>
          <label>Period
            <select value={preset} onChange={e => pick(e.target.value)}>
              <option value="today">Daily (today)</option>
              <option value="week">Weekly (last 7 days)</option>
              <option value="month">Monthly (this month)</option>
              <option value="all">All time</option>
              <option value="custom">Custom dates</option>
            </select>
          </label>
          <div className="filters">
            <label>From<input type="date" value={from} onChange={e => { setPreset('custom'); setRange([e.target.value, to]) }} /></label>
            <label>To<input type="date" value={to} onChange={e => { setPreset('custom'); setRange([from, e.target.value]) }} /></label>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
      {loading ? <p className="muted">Loading…</p> : type === 'outstanding' ? (
        <>
          <div className="totals"><div>Customers owing<b>{owing.length}</b></div><div style={{ gridColumn: 'span 2' }}>Total outstanding<b className="orange">{inr(sum(owing, c => c.balance))}</b></div></div>
          {owing.map(c => <div key={c.id} className="tx"><span>{c.name}<small>{c.phone}</small></span><b className="orange">{inr(c.balance)}</b></div>)}
          {owing.length === 0 && <p className="muted">Nobody owes you anything.</p>}
        </>
      ) : (
        <>
          <div className="totals">
            <div>Credit<b className="red">{inr(sum(credits))}</b></div>
            <div>Payments<b className="green">{inr(sum(pays))}</b></div>
            <div>Net<b className="orange">{inr(sum(credits) - sum(pays))}</b></div>
          </div>
          {list.length === 0 && <p className="muted">No transactions in this period.</p>}
          {list.map(t => (
            <div key={t.id} className="tx">
              <span>{name(t.customer_id)}<small>{t.txn_date} · {t.type === 'payment' ? t.payment_method : t.description || 'Credit'}</small></span>
              <b className={t.type === 'payment' ? 'green' : 'red'}>{t.type === 'payment' ? '+' : '−'}{inr(t.amount)}</b>
            </div>
          ))}
        </>
      )}
      <button className="btn" onClick={exportCsv} disabled={loading} style={{ marginTop: 12 }}>Download CSV</button>
    </div>
  )
}
