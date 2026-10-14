import { FileText, IndianRupee, Shield, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react'
import {
  MOCK_STATS, MOCK_ACTIVITY, MOCK_PURCHASES, MOCK_WARRANTIES,
  MOCK_SPENDING_BY_CATEGORY, formatINR, formatDate, CATEGORY_COLORS,
} from '../data/mockData'

// ── Stat Card ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  FileText:    FileText,
  IndianRupee: IndianRupee,
  Shield:      Shield,
  ShoppingBag: ShoppingBag,
}

function StatCard({ stat }: { stat: typeof MOCK_STATS[number] }) {
  const Icon = ICON_MAP[stat.icon] ?? FileText
  return (
    <div className="glass" style={{
      borderRadius: '16px', padding: '1.5rem',
      display:'flex', flexDirection:'column', gap:'0.75rem',
      transition:'transform 0.2s, box-shadow 0.2s',
      cursor:'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)' }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{
          width:42, height:42, borderRadius:10,
          background:'rgba(108,99,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Icon size={20} color="#a78bfa" />
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:'0.3rem',
          fontSize:'0.75rem', color: stat.positive ? 'var(--color-success)' : '#fbbf24',
        }}>
          {stat.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {stat.change}
        </div>
      </div>
      <div>
        <div style={{ fontSize:'1.75rem', fontWeight:800, fontFamily:'var(--font-display)', lineHeight:1.1 }}>
          {stat.value}
        </div>
        <div style={{ fontSize:'0.82rem', color:'var(--color-muted)', marginTop:'0.25rem' }}>
          {stat.label}
        </div>
      </div>
    </div>
  )
}

// ── Spending Bar chart (CSS only, no library needed) ──────────────────────────
function SpendingChart() {
  const total = MOCK_SPENDING_BY_CATEGORY.reduce((s, c) => s + c.amount, 0)
  return (
    <div className="glass" style={{ borderRadius:16, padding:'1.5rem' }}>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'1.25rem', fontSize:'0.95rem' }}>
        Spending by Category
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {MOCK_SPENDING_BY_CATEGORY.map(c => {
          const pct = Math.round((c.amount / total) * 100)
          return (
            <div key={c.category}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem', fontSize:'0.82rem' }}>
                <span style={{ color:'var(--color-text)' }}>{c.category}</span>
                <span style={{ color:'var(--color-muted)' }}>{formatINR(c.amount)} ({pct}%)</span>
              </div>
              <div style={{
                height:6, borderRadius:3,
                background:'rgba(255,255,255,0.06)',
                overflow:'hidden',
              }}>
                <div style={{
                  height:'100%', width:`${pct}%`,
                  background:`linear-gradient(90deg, ${c.color}, ${c.color}aa)`,
                  borderRadius:3,
                  transition:'width 0.6s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop:'1rem', fontSize:'0.75rem', color:'var(--color-muted)', borderTop:'1px solid var(--color-border)', paddingTop:'0.75rem' }}>
        Total tracked: <strong style={{ color:'var(--color-accent2)' }}>{formatINR(total)}</strong>
      </div>
    </div>
  )
}

// ── Recent Purchases table ────────────────────────────────────────────────────
function RecentPurchases() {
  const recent = MOCK_PURCHASES.slice(0, 5)
  return (
    <div className="glass" style={{ borderRadius:16, padding:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem' }}>Recent Purchases</span>
        <a href="/app/purchases" style={{ fontSize:'0.78rem', color:'var(--color-accent)', textDecoration:'none' }}>View all →</a>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {recent.map(p => (
          <div key={p.id} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0.65rem 0.75rem', borderRadius:10,
            background:'rgba(255,255,255,0.02)', border:'1px solid transparent',
            transition:'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(108,99,255,0.07)'; e.currentTarget.style.borderColor='rgba(108,99,255,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='transparent' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{
                width:36, height:36, borderRadius:8, flexShrink:0,
                background:`${CATEGORY_COLORS[p.category]}18`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1rem',
              }}>
                {p.merchantName[0]}
              </div>
              <div>
                <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{p.merchantName}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--color-muted)' }}>
                  {p.category} · {formatDate(p.date)}
                </div>
              </div>
            </div>
            <div style={{ fontSize:'0.9rem', fontWeight:700, color:CATEGORY_COLORS[p.category] }}>
              {formatINR(p.total)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div className="glass" style={{ borderRadius:16, padding:'1.5rem' }}>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'1.25rem', fontSize:'0.95rem' }}>
        Recent Activity
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
        {MOCK_ACTIVITY.map(a => (
          <div key={a.id} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
            <div style={{
              width:32, height:32, borderRadius:8, flexShrink:0,
              background:'rgba(255,255,255,0.04)', border:'1px solid var(--color-border)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.9rem',
            }}>
              {a.icon}
            </div>
            <div>
              <div style={{ fontSize:'0.83rem', lineHeight:1.4 }}>{a.description}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--color-muted)', marginTop:'0.15rem' }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Warranty Alert Banner ─────────────────────────────────────────────────────
function WarrantyAlerts() {
  const expiringSoon = MOCK_WARRANTIES.filter(w => w.status === 'expiring_soon')
  if (!expiringSoon.length) return null
  return (
    <div style={{
      background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.3)',
      borderRadius:12, padding:'1rem 1.25rem', display:'flex', gap:'1rem', alignItems:'center',
    }}>
      <Shield size={22} color="#fbbf24" style={{ flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'0.88rem', fontWeight:700, color:'#fbbf24', marginBottom:'0.25rem' }}>
          {expiringSoon.length} warranty{expiringSoon.length > 1 ? 'ies' : ''} expiring soon!
        </div>
        <div style={{ fontSize:'0.8rem', color:'var(--color-muted)' }}>
          {expiringSoon.map(w => `${w.productName} (${w.daysRemaining}d)`).join(' · ')}
        </div>
      </div>
      <a href="/app/warranty" style={{
        fontSize:'0.78rem', color:'#fbbf24', textDecoration:'none', flexShrink:0,
        background:'rgba(251,191,36,0.12)', padding:'0.35rem 0.75rem', borderRadius:6,
      }}>
        View all →
      </a>
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {/* Warranty alert */}
      <WarrantyAlerts />

      {/* Greeting */}
      <div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, margin:0 }}>
          Good evening, Sai Mahesh 👋
        </h2>
        <p style={{ color:'var(--color-muted)', fontSize:'0.88rem', margin:'0.25rem 0 0' }}>
          Here's a snapshot of your purchase wallet.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem' }}>
        {MOCK_STATS.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* Main content: chart + activity */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <SpendingChart />
        <ActivityFeed />
      </div>

      {/* Recent purchases */}
      <RecentPurchases />
    </div>
  )
}
