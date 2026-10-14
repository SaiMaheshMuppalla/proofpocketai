import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MyPurchases from './pages/MyPurchases'
import Documents from './pages/Documents'
import WarrantyTracker from './pages/WarrantyTracker'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

// ── Stub page for nav items not yet built ─────────────────────────────────────
function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: 'var(--color-muted)' }}>This section is coming in a future phase.</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public landing page (with top navbar) ────────────────── */}
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

              {/* ── Main pages (Phase 1) ─────────────────────────────── */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="purchases" element={<MyPurchases />} />
              <Route path="documents" element={<Documents />} />
              <Route path="warranty" element={<WarrantyTracker />} />

              {/* ── Stub routes (future phases) ──────────────────────── */}
              <Route path="upload" element={<ComingSoon title="Upload Document" />} />
              <Route path="settings" element={<ComingSoon title="Settings" />} />
              <Route path="help" element={<ComingSoon title="Help & Support" />} />
            </Route>
          </Route>

          {/* Catch-all: send unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
