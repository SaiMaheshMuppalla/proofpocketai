import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase'

// ─── Temporary Supabase connection diagnostic (console-only) ─────────────────
supabase
  .from('purchases')
  .select('id')
  .limit(1)
  .then(
    ({ data, error, status }) => {
      if (error) {
        console.error('[Supabase Test] Query failed on purchases table:', error)
      } else {
        console.log(
          '%c[Supabase Test] Connected successfully! HTTP ' + status + ' OK. (rows returned: ' + (data?.length ?? 0) + ')',
          'color: #10b981; font-weight: bold; font-size: 13px;'
        )
      }
    },
    (err: unknown) => {
      console.error('[Supabase Test] Network error connecting to Supabase:', err)
    }
  )

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
