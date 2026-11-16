import { createClient } from '@supabase/supabase-js'

// These two values are PUBLIC by design (publishable key). RLS protects the data.
// NEVER put the Supabase "secret" key in this project.
const SUPABASE_URL = 'https://wumywycgithlmkgnvexs.supabase.co'
const SUPABASE_KEY = 'sb_publishable_sgcnuQ_ovd9-Bw78O5opSg_Zn-iFBTw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
