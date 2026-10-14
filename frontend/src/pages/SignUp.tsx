import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase'
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

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
      // Immediate session granted
      navigate('/app/dashboard', { replace: true })
    } else {
      // Email confirmation required
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
          maxWidth: '460px',
          padding: '2.75rem 2.25rem',
          boxShadow: '0 12px 40px rgba(56, 26, 22, 0.06)',
        }}
      >
        {/* Brand Header */}
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
            Create your permanent pocket
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0 }}>
            Organize receipts, invoices, and warranties with ease
          </p>
        </div>

        {/* Success Notice if email confirmation is required */}
        {successInfo ? (
          <div
            style={{
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              borderRadius: '14px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-success)' }}>
              Check your inbox
            </h3>
            <p style={{ color: 'var(--color-text)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              {successInfo}
            </p>
            <Link to="/login" className="btn-coral" style={{ textDecoration: 'none' }}>
              Proceed to Sign in
            </Link>
          </div>
        ) : (
          <>
            {/* Unconfigured Notice */}
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  style={{
                    display: 'block',
                    fontSize: '0.83rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.45rem',
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
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
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Muppalla Sai Mahesh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-editorial"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="signup-email"
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
                    id="signup-email"
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

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: 'block',
                    fontSize: '0.83rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.45rem',
                  }}
                >
                  Password (min. 6 characters)
                </label>
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
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '0.83rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.45rem',
                  }}
                >
                  Confirm Password
                </label>
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
                    id="signup-confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-editorial"
                    style={{ paddingLeft: '2.4rem' }}
                  />
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
                    <Loader2 size={18} className="animate-spin" /> Creating your pocket...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
