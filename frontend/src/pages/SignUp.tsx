import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase'
import { Wallet, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'

export default function SignUp() {
  const { user, loading: authLoading, signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  // Redirect if already logged in
  React.useEffect(() => {
    if (!authLoading && user) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessInfo(null)

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error, session } = await signUp(email, password, fullName)
    setSubmitting(false)

    if (error) {
      setErrorMsg(error.message || 'Failed to create account. Please try again.')
    } else if (session) {
      // Immediate session granted (email confirmation disabled in Supabase)
      navigate('/app/dashboard', { replace: true })
    } else {
      // Email confirmation required by Supabase configuration
      setSuccessInfo(
        'Account created successfully! Please check your email inbox to confirm your account, then sign in.'
      )
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
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.14) 0%, transparent 65%)',
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
          maxWidth: '440px',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            Create your account
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0 }}>
            Start organising your receipts and warranties with AI
          </p>
        </div>

        {/* Success Notice */}
        {successInfo ? (
          <div
            style={{
              background: 'rgba(34, 211, 161, 0.12)',
              border: '1px solid rgba(34, 211, 161, 0.35)',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={32} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-success)' }}>
              Check your inbox
            </h3>
            <p style={{ color: 'var(--color-text)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              {successInfo}
            </p>
            <Link
              to="/login"
              className="btn-primary"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                padding: '0.6rem 1.5rem',
                fontSize: '0.88rem',
              }}
            >
              Go to Sign in
            </Link>
          </div>
        ) : (
          <>
            {/* Unconfigured notice */}
            {!isSupabaseConfigured && !errorMsg && (
              <div
                style={{
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
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
                  marginBottom: '1.25rem',
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--color-text)',
                  }}
                >
                  Full name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
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
                    id="signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muppalla Sai Mahesh"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
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

              {/* Email address */}
              <div>
                <label
                  htmlFor="signup-email"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
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
                    id="signup-email"
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
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
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

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--color-text)',
                  }}
                >
                  Password (min 6 characters)
                </label>
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
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '0.65rem 2.6rem 0.65rem 2.4rem',
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    color: 'var(--color-text)',
                  }}
                >
                  Confirm password
                </label>
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
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
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

              {/* Submit Button */}
              <button
                type="submit"
                id="signup-submit-btn"
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Login link */}
            <div
              style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--color-muted)',
              }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--color-accent2)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
