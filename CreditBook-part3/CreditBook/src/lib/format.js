export const inr = n =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n) || 0)
export const todayStr = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
export const validAmount = v =>
  /^\d+(\.\d{1,2})?$/.test(String(v).trim()) && Number(v) > 0 && Number(v) <= 99999999
