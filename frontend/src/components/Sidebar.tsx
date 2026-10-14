import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, FileText,
  Shield, Wallet, ChevronLeft, ChevronRight,
  Upload, Settings, HelpCircle, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard',        path: '/app/dashboard',          icon: LayoutDashboard },
  { label: 'My Purchases',     path: '/app/purchases',          icon: ShoppingBag     },
  { label: 'Documents',        path: '/app/documents',          icon: FileText        },
  { label: 'Warranty Tracker', path: '/app/warranty',           icon: Shield          },
]

const BOTTOM_ITEMS = [
  { label: 'Upload',   path: '/app/upload',   icon: Upload   },
  { label: 'Settings', path: '/app/settings', icon: Settings },
  { label: 'Help',     path: '/app/help',     icon: HelpCircle },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const fullName = (user?.user_metadata?.full_name as string) || ''
  const email = user?.email || ''
  const displayName = fullName || email.split('@')[0] || 'User'
  const initials = fullName
    ? fullName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase() || 'U'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside style={{
      width:           collapsed ? '68px' : '220px',
      minHeight:       '100vh',
      background:      'var(--color-surface)',
      borderRight:     '1px solid var(--color-border)',
      display:         'flex',
      flexDirection:   'column',
      transition:      'width 0.25s ease',
      position:        'sticky',
      top:             0,
      flexShrink:      0,
      zIndex:          50,
    }}>
      {/* ── Logo row ─────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding:        '1.25rem 1rem',
        borderBottom:   '1px solid var(--color-border)',
      }}>
        {!collapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <div style={{
              width:32, height:32, borderRadius:8,
              background:'linear-gradient(135deg,#6c63ff,#a78bfa)',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
              boxShadow:'0 0 12px rgba(108,99,255,0.4)',
            }}>
              <Wallet size={17} color="#fff" />
            </div>
            <span style={{
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem',
              whiteSpace:'nowrap', overflow:'hidden',
            }}>
              Proof<span style={{ color:'#a78bfa' }}>Pocket</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg,#6c63ff,#a78bfa)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Wallet size={17} color="#fff" />
          </div>
        )}
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          style={{
            background:'rgba(255,255,255,0.05)', border:'1px solid var(--color-border)',
            borderRadius:6, width:24, height:24, display:'flex', alignItems:'center',
            justifyContent:'center', cursor:'pointer', color:'var(--color-muted)',
            flexShrink:0, marginLeft: collapsed ? 0 : '0.25rem',
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* ── Main nav ─────────────────────────────────────────── */}
      <nav style={{ flex:1, padding:'0.75rem 0.5rem', display:'flex', flexDirection:'column', gap:'2px' }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '0.65rem',
                padding:        '0.6rem 0.75rem',
                borderRadius:   '8px',
                textDecoration: 'none',
                color:          active ? '#fff' : 'var(--color-muted)',
                background:     active ? 'linear-gradient(135deg,rgba(108,99,255,0.25),rgba(167,139,250,0.15))' : 'transparent',
                border:         active ? '1px solid rgba(108,99,255,0.35)' : '1px solid transparent',
                transition:     'all 0.18s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                whiteSpace:     'nowrap',
                overflow:       'hidden',
                position:       'relative',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color       = 'var(--color-text)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color       = 'var(--color-muted)'
                }
              }}
            >
              {/* Active bar */}
              {active && (
                <div style={{
                  position:'absolute', left:0, top:'20%', bottom:'20%',
                  width:3, borderRadius:2, background:'#6c63ff',
                }} />
              )}
              <item.icon
                size={18}
                color={active ? '#a78bfa' : 'currentColor'}
                style={{ flexShrink:0 }}
              />
              {!collapsed && (
                <span style={{ fontSize:'0.875rem', fontWeight: active ? 600 : 400 }}>
                  {item.label}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Bottom nav ───────────────────────────────────────── */}
      <div style={{ padding:'0.75rem 0.5rem', borderTop:'1px solid var(--color-border)', display:'flex', flexDirection:'column', gap:'2px' }}>
        {BOTTOM_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            style={{
              display:'flex', alignItems:'center', gap:'0.65rem',
              padding:'0.55rem 0.75rem', borderRadius:'8px',
              textDecoration:'none', color:'var(--color-muted)',
              transition:'all 0.18s ease', justifyContent: collapsed ? 'center' : 'flex-start',
              whiteSpace:'nowrap', overflow:'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='var(--color-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--color-muted)' }}
          >
            <item.icon size={17} style={{ flexShrink:0 }} />
            {!collapsed && <span style={{ fontSize:'0.85rem' }}>{item.label}</span>}
          </NavLink>
        ))}

        {/* ── User chip & Logout ─────────────────────────── */}
        {!collapsed ? (
          <div style={{
            marginTop:'0.75rem', padding:'0.6rem 0.75rem', borderRadius:8,
            background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.2)',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.6rem',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', minWidth:0, overflow:'hidden' }}>
              <div style={{
                width:28, height:28, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#6c63ff,#22d3a1)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.72rem', fontWeight:700, color:'#fff',
              }}>
                {initials}
              </div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontSize:'0.78rem', fontWeight:600, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {displayName}
                </div>
                <div style={{ fontSize:'0.68rem', color:'var(--color-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {email || 'Free plan'}
                </div>
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={handleSignOut}
              title="Log out"
              style={{
                background:'none', border:'none', color:'var(--color-muted)',
                cursor:'pointer', padding:'4px', display:'flex', alignItems:'center',
                borderRadius:6, transition:'all 0.2s', flexShrink:0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--color-danger)'; e.currentTarget.style.background='rgba(248,113,113,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--color-muted)'; e.currentTarget.style.background='none' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ marginTop:'0.75rem', display:'flex', justifyContent:'center' }}>
            <button
              id="sidebar-collapsed-logout-btn"
              onClick={handleSignOut}
              title={`Logged in as ${email} — Click to Log out`}
              style={{
                width:30, height:30, borderRadius:'50%',
                background:'linear-gradient(135deg,#6c63ff,#22d3a1)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.72rem', fontWeight:700, color:'#fff', border:'none',
                cursor:'pointer',
              }}
            >
              {initials}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
