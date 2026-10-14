import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/purchases': 'My Purchases',
  '/app/documents': 'Documents',
  '/app/warranty': 'Warranty Tracker',
  '/app/upload': 'Upload Document',
  '/app/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'ProofPocket AI'

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Derive display initials and name
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
        height: '60px',
        background: 'rgba(18,20,28,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 700,
          margin: 0,
          flexShrink: 0,
        }}
      >
        {title}
      </h1>

      {/* Search bar */}
      <div
        style={{
          flex: 1,
          maxWidth: '400px',
          position: 'relative',
        }}
      >
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          id="topbar-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents, merchants…"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '0.45rem 0.75rem 0.45rem 2.2rem',
            color: 'var(--color-text)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'var(--font-sans)',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#6c63ff')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* Upload CTA */}
        <button
          id="topbar-upload-btn"
          className="btn-primary"
          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={14} /> Upload
        </button>

        {/* Bell with badge */}
        <button
          id="topbar-bell-btn"
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-muted)',
          }}
        >
          <Bell size={17} />
          {/* 2 warranty alerts badge */}
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f87171',
              border: '2px solid var(--color-surface)',
            }}
          />
        </button>

        {/* Avatar & Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            id="topbar-avatar-btn"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #6c63ff, #22d3a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#fff',
              border: 'none',
              boxShadow: menuOpen ? '0 0 12px rgba(108, 99, 255, 0.6)' : 'none',
              transition: 'box-shadow 0.2s',
            }}
            title={email}
            aria-label="User profile menu"
          >
            {initials}
          </button>

          {/* User Menu Dropdown */}
          {menuOpen && (
            <div
              className="glass"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                borderRadius: '12px',
                padding: '0.75rem',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 60,
              }}
            >
              <div style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email}
                </div>
              </div>

              <button
                id="topbar-signout-btn"
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
