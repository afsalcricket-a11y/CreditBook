import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { inr, todayStr, validAmount } from '../lib/format'

// One form for both Credit and Payment. type = 'credit' or 'payment'
export default function TxForm({ type }) {
  const isPay = type === 'payment'
  const [params] = useSearchParams()
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState(params.get('c') || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [method, setMethod] = useState('Cash')
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  async function loadCustomers() {
    const { data } = await supabase.from('customer_balances').select('id,name,balance').order('name')
    setCustomers(data || [])
  }
  useEffect(() => { loadCustomers() }, [])

  const current = customers.find(c => c.id === customerId)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setError(''); setDone('')
    if (!customerId) return setError('Please select a customer.')
    if (!validAmount(amount)) return setError('Enter a valid amount greater than 0 (max 2 decimals).')
    if (!date) return setError('Please choose a date.')
    setBusy(true)
    const { error } = await supabase.rpc('add_transaction', {
      p_customer_id: customerId, p_type: type, p_amount: Number(amount),
      p_description: description, p_method: isPay ? method : null,
      p_date: date, p_notes: notes, p_request_id: requestId,
    })
    if (error) setError(error.message)
    else {
      setDone(`${isPay ? 'Payment' : 'Credit'} of ${inr(amount)} saved.`)
      setAmount(''); setDescription(''); setNotes('')
      setRequestId(crypto.randomUUID()) // new id for the next entry
      loadCustomers()
    }
    setBusy(false)
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{isPay ? 'Receive payment' : 'Give credit'}</h2>
      <label>Customer
        <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
          <option value="">Select customer…</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      {current && <p className="muted">Current balance: <b className={Number(current.balance) > 0 ? 'orange' : 'green'}>{inr(current.balance)}</b></p>}
      {customers.length === 0 && <p className="muted">No customers yet. <Link to="/customers/new">Add a customer</Link> first.</p>}
      <label>Amount (₹)
        <input type="number" inputMode="decimal" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
      </label>
      {isPay && (
        <label>Payment method
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Other</option>
          </select>
        </label>
      )}
      {!isPay && <label>Description<input maxLength={200} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Rice 10kg" /></label>}
      <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
      <label>Notes (optional)<textarea rows={2} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} /></label>
      {error && <p className="error">{error}</p>}
      {done && <p className="success">{done}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : isPay ? 'Save payment' : 'Save credit'}</button>
    </form>
  )
}
