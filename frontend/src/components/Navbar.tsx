import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Menu, X, ArrowRight } from 'lucide-react'
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
    { label: 'How it works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
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
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(10,11,16,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(42,45,62,0.8)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(108,99,255,0.5)',
            }}
          >
            <Wallet size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text)' }}>
            Proof<span className="gradient-text">Pocket</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                style={{
                  color: 'var(--color-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <button
              id="navbar-dashboard-btn"
              onClick={() => navigate('/app/dashboard')}
              className="btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              Go to Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button
                id="navbar-signin-btn"
                onClick={() => navigate('/login')}
                className="btn-outline"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
              >
                Sign in
              </button>
              <button
                id="navbar-signup-btn"
                onClick={() => navigate('/signup')}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
              >
                Get started
              </button>
            </>
          )}

          {/* Hamburger (mobile) */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'none' }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="glass" style={{ borderRadius: '12px', margin: '0.5rem 0 1rem', padding: '1rem' }}>
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '0.6rem 0.5rem', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500 }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {user ? (
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/app/dashboard')
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/login')
                  }}
                  className="btn-outline"
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/signup')
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
