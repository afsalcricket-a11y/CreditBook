import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('business_name').eq('id', user.id).single()
      .then(({ data }) => setName(data?.business_name || ''))
  }, [user.id])

  return (
    <div className="card">
      <h2>Welcome{name ? `, ${name}` : ''} 👋</h2>
      <p className="muted">You are logged in. The dashboard, customers, credit and payment screens are added in Part 3.</p>
    </div>
  )
}
