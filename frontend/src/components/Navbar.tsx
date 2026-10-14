import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Warranty Tracking', href: '#warranty' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
  ]

  return (
    <nav
      id="navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 1.5rem',
        transition: 'all 0.25s ease',
        backgroundColor: scrolled ? 'rgba(247, 243, 233, 0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(240, 68, 56, 0.28)',
            }}
          >
            <ShieldCheck size={20} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              fontSize: '1.22rem',
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}
          >
            ProofPocket<span style={{ color: 'var(--color-accent)' }}>.ai</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="hidden md:flex"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--color-muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden md:flex">
          {user ? (
            <button
              onClick={() => navigate('/app/dashboard')}
              className="btn-coral"
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.25rem' }}
            >
              Open Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="btn-editorial-ghost"
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-coral"
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.25rem' }}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          className="md:hidden animate-slide-up"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 12px 30px rgba(56, 26, 22, 0.08)',
          }}
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                textDecoration: 'none',
                padding: '0.4rem 0',
              }}
            >
              {item.label}
            </a>
          ))}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
          {user ? (
            <button
              onClick={() => {
                setMenuOpen(false)
                navigate('/app/dashboard')
              }}
              className="btn-coral"
              style={{ width: '100%' }}
            >
              Go to Dashboard
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/login')
                }}
                className="btn-editorial-ghost"
                style={{ width: '100%' }}
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/signup')
                }}
                className="btn-coral"
                style={{ width: '100%' }}
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
