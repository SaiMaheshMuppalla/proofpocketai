import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface TopBarProps {
  onOpenAddModal?: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Warranty Dashboard',
  '/app/purchases': 'My Purchases',
  '/app/documents': 'Saved Documents',
  '/app/warranty': 'Warranty Tracker',
  '/app/settings': 'Settings & Profile',
}

export default function TopBar({ onOpenAddModal }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'ProofPocket AI'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fullName = (user?.user_metadata?.full_name as string) || ''
  const email = user?.email || ''
  const displayName = fullName || email.split('@')[0] || 'User'
  const initials = fullName
    ? fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : email.slice(0, 2).toUpperCase() || 'U'

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/login')
  }

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'rgba(247, 243, 233, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.45rem',
            color: 'var(--color-text)',
            margin: 0,
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {title}
        </h1>
        <span className="pill-badge pill-coral" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
          Live Pocket
        </span>
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* + Add Product Primary Action */}
        <button
          onClick={onOpenAddModal}
          className="btn-coral"
          style={{ fontSize: '0.84rem', padding: '0.5rem 1.15rem' }}
        >
          <Plus size={16} strokeWidth={2.4} /> Add Product
        </button>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open user menu"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid var(--color-border-strong)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(56, 26, 22, 0.06)',
            }}
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              className="card-editorial animate-slide-up"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '240px',
                padding: '0.6rem',
                zIndex: 60,
                boxShadow: '0 12px 36px rgba(56, 26, 22, 0.12)',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 0.85rem',
                  borderBottom: '1px solid var(--color-border)',
                  marginBottom: '0.4rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>{displayName}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)', wordBreak: 'break-all' }}>{email}</div>
              </div>

              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-danger)',
                  transition: 'background 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
