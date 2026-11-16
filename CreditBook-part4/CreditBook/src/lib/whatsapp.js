// Builds a WhatsApp click-to-chat link. 10-digit numbers get India code 91.
export function waLink(phone, text) {
  let d = String(phone).replace(/\D/g, '')
  if (d.length === 10) d = '91' + d
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`
}
