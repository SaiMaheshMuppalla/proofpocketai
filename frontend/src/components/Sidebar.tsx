import { useState } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  onOpenAddModal?: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Purchases', path: '/app/purchases', icon: ShoppingBag },
  { label: 'Documents', path: '/app/documents', icon: FileText },
  { label: 'Warranty Tracker', path: '/app/warranty', icon: Shield },
  { label: 'Settings', path: '/app/settings', icon: Settings },
]

export default function Sidebar({ onOpenAddModal }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

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
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '230px',
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* ── Brand Logo Header ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '1.25rem 1rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          to="/app/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(240, 68, 56, 0.28)',
            }}
          >
            <ShieldCheck size={20} color="#FFFFFF" strokeWidth={2.4} />
          </div>

          {!collapsed && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              ProofPocket<span style={{ color: 'var(--color-accent)' }}>.ai</span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: '0.3rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-muted)',
            padding: '0.5rem',
            margin: '0.5rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* ── Primary Action: Add Product ───────────────────────── */}
      <div style={{ padding: collapsed ? '0.75rem 0.5rem' : '1rem' }}>
        <button
          onClick={onOpenAddModal}
          className="btn-coral"
          title="Add Product"
          style={{
            width: '100%',
            padding: collapsed ? '0.65rem 0' : '0.65rem 1rem',
            borderRadius: '12px',
            fontSize: '0.88rem',
          }}
        >
          <Plus size={18} strokeWidth={2.4} />
          {!collapsed && <span>Add Product</span>}
        </button>
      </div>

      {/* ── Navigation Items ──────────────────────────────────── */}
      <nav style={{ padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.7rem 0' : '0.7rem 0.9rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                backgroundColor: isActive ? 'var(--color-accent-soft)' : 'transparent',
                border: isActive ? '1px solid var(--color-accent-border)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={19} color={isActive ? 'var(--color-accent)' : 'var(--color-muted)'} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* ── User Profile & Sign Out ───────────────────────────── */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-text)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--color-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {email}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign out of account"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)',
                padding: '0.35rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
