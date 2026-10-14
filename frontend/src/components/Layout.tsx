import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

/**
 * Layout — the persistent app shell used for all dashboard pages.
 * Renders: [Sidebar | TopBar + <page content>]
 *
 * The <Outlet /> is where React Router renders the active child page
 * (Dashboard, MyPurchases, Documents, WarrantyTracker).
 */
export default function Layout() {
  return (
    <div style={{
      display:        'flex',
      minHeight:      '100vh',
      background:     'var(--color-bg)',
    }}>
      <Sidebar />

      {/* Main column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <TopBar />
        <main style={{
          flex:       1,
          padding:    '1.75rem 2rem',
          overflowY:  'auto',
        }}>
          {/* ── MOCK DATA NOTICE ────────────────────────────────────
              The banner below is visible only in development so you
              always know you're looking at prototype data, not real
              Supabase data. It will be removed in Phase 3.
          ────────────────────────────────────────────────────────── */}
          <div style={{
            background:   'rgba(251,191,36,0.08)',
            border:       '1px solid rgba(251,191,36,0.3)',
            borderRadius: '8px',
            padding:      '0.5rem 1rem',
            marginBottom: '1.5rem',
            fontSize:     '0.8rem',
            color:        '#fbbf24',
            display:      'flex',
            alignItems:   'center',
            gap:          '0.5rem',
          }}>
            <span>⚡</span>
            <span>
              <strong>Prototype mode</strong> — all data below is sample data from{' '}
              <code style={{ fontSize:'0.75rem', background:'rgba(251,191,36,0.1)', padding:'0 4px', borderRadius:3 }}>
                src/data/mockData.ts
              </code>
              . Real backend connects in Phase 3.
            </span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
