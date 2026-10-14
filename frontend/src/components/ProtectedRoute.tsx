import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, Loader2 } from 'lucide-react'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg, #0a0b10)',
          color: 'var(--color-text, #f1f2f6)',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(108, 99, 255, 0.45)',
          }}
        >
          <Wallet size={26} color="#fff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-accent, #6c63ff)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-muted, #8b8ea4)' }}>
            Verifying session...
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
