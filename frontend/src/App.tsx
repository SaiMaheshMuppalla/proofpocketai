import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MyPurchases from './pages/MyPurchases'
import Documents from './pages/Documents'
import WarrantyTracker from './pages/WarrantyTracker'
import UploadProduct from './pages/UploadProduct'
import Settings from './pages/Settings'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function HelpPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 800,
            color: 'var(--color-accent)',
          }}
        >
          Customer Support
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 900,
            lineHeight: 1.15,
            color: 'var(--color-text)',
            margin: '0.2rem 0 0.5rem',
          }}
        >
          Help & Support Guide
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-muted)', margin: 0 }}>
          Everything you need to know about managing warranties, lodging claims, and vault data security.
        </p>
      </div>

      <div className="card-editorial" style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          How do I claim a warranty?
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
          Navigate to <strong>Warranty Tracker</strong>, select the relevant product, and view the provider details and
          service contact phone/email. Download your original signed receipt or invoice from the <strong>Document Vault</strong>{' '}
          to present to the authorized repair center.
        </p>
      </div>

      <div className="card-editorial" style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Are my receipts and personal invoices private?
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
          Yes. All files are deposited in private Supabase Storage buckets secured by Row Level Security (RLS). Only your
          authenticated Supabase user account can generate short-lived signed URLs to view or download files.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public landing page ─────────────────────────────── */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <LandingPage />
              </>
            }
          />

          {/* ── Public Auth routes ───────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* ── Protected App shell: sidebar + topbar ────────────────── */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Redirect /app → /app/dashboard */}
              <Route index element={<Navigate to="/app/dashboard" replace />} />

              {/* ── Main pages ───────────────────────────────────────── */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="purchases" element={<MyPurchases />} />
              <Route path="documents" element={<Documents />} />
              <Route path="warranty" element={<WarrantyTracker />} />
              <Route path="upload" element={<UploadProduct />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpPage />} />
            </Route>
          </Route>

          {/* Catch-all: send unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
