import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function Login() {
  const { user, loading: authLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard'

  // If already authenticated, redirect
  React.useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.')
      return
    }

    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      setErrorMsg(error.message || 'Failed to sign in. Please verify your credentials.')
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: '2rem 1.5rem',
        position: 'relative',
      }}
    >
      {/* Back to Home Link */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          color: 'var(--color-muted)',
          textDecoration: 'none',
          fontSize: '0.88rem',
          fontWeight: 600,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div
        className="card-editorial animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.75rem 2.25rem',
          boxShadow: '0 12px 40px rgba(56, 26, 22, 0.06)',
        }}
      >
        {/* Brand Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(240, 68, 56, 0.28)',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={26} color="#FFFFFF" strokeWidth={2.3} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.85rem',
              color: 'var(--color-text)',
              margin: '0 0 0.4rem',
              lineHeight: 1.2,
            }}
          >
            Welcome back to your wallet
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0 }}>
            Sign in to check your active warranties and receipts
          </p>
        </div>

        {/* Configuration Notice if Missing */}
        {!isSupabaseConfigured && !errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              color: 'var(--color-warning)',
              fontSize: '0.84rem',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{supabaseConfigError}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              color: 'var(--color-danger)',
              fontSize: '0.84rem',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email field */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.83rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '0.45rem',
              }}
            >
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-editorial"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.83rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-editorial"
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-muted)',
                  padding: '0.2rem',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-coral"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in...
              </>
            ) : (
              'Sign in to Pocket'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
          Don't have a pocket yet?{' '}
          <Link
            to="/signup"
            style={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
