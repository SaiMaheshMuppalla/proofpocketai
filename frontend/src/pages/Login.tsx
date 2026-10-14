import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase'
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

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
      setErrorMsg('Please enter both email and password.')
      return
    }

    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.')
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
        background: 'var(--color-bg)',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108, 99, 255, 0.14) 0%, transparent 65%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Back to Home link */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '1.75rem',
          left: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--color-muted)',
          textDecoration: 'none',
          fontSize: '0.88rem',
          fontWeight: 500,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div
        className="glass animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(108, 99, 255, 0.45)',
              marginBottom: '1rem',
            }}
          >
            <Wallet size={24} color="#fff" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.65rem',
              margin: '0 0 0.4rem',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0 }}>
            Sign in to access your purchase documents
          </p>
        </div>

        {/* Unconfigured notice */}
        {!isSupabaseConfigured && !errorMsg && (
          <div
            style={{
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: '#fbbf24',
              fontSize: '0.83rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{supabaseConfigError}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(248, 113, 113, 0.12)',
              border: '1px solid rgba(248, 113, 113, 0.35)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Email input */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.45rem',
                color: 'var(--color-text)',
              }}
            >
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
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
                  left: '0.85rem',
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '0.7rem 2.6rem 0.7rem 2.4rem',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={submitting}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: submitting ? 0.75 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Sign up prompt */}
        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--color-muted)',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: 'var(--color-accent2)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
