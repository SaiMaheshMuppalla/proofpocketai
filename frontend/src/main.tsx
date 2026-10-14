import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isSupabaseConfigured, testSupabaseConnection } from './lib/supabase'

// Diagnostic check only when credentials are valid
if (isSupabaseConfigured) {
  testSupabaseConnection().then((result) => {
    if (result.success) {
      console.log(
        '%c[Supabase] ' + result.message,
        'color: #10b981; font-weight: bold; font-size: 13px;'
      )
    } else {
      console.warn('[Supabase] Connection probe notice:', result.message)
    }
  })
} else {
  console.warn(
    '[ProofPocket AI] Supabase credentials are not configured. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.'
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
