const cell = v => {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s) && isNaN(Number(s))) s = "'" + s // blocks spreadsheet formula tricks
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
export function downloadCsv(name, header, rows) {
  const text = [header, ...rows].map(r => r.map(cell).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
