import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, XCircle, Calendar, FileText } from 'lucide-react'
import { MOCK_WARRANTIES, CATEGORY_COLORS, formatDate, type WarrantyStatus } from '../data/mockData'

const STATUS_CONFIG: Record<WarrantyStatus, { label:string; color:string; bg:string; icon: React.ElementType }> = {
  active:         { label:'Active',         color:'#22d3a1', bg:'rgba(34,211,161,0.1)',  icon:CheckCircle   },
  expiring_soon:  { label:'Expiring Soon',  color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  icon:AlertTriangle },
  expired:        { label:'Expired',        color:'#f87171', bg:'rgba(248,113,113,0.1)', icon:XCircle       },
}

function WarrantyCard({ item }: { item: typeof MOCK_WARRANTIES[number] }) {
  const cfg = STATUS_CONFIG[item.status]
  const StatusIcon = cfg.icon
  const catColor = CATEGORY_COLORS[item.category]

  return (
    <div className="glass" style={{
      borderRadius:16, padding:'1.25rem',
      display:'flex', flexDirection:'column', gap:'1rem',
      border:`1px solid ${item.status === 'expiring_soon' ? 'rgba(251,191,36,0.3)' : item.status === 'expired' ? 'rgba(248,113,113,0.2)' : 'var(--color-border)'}`,
      transition:'transform 0.2s, box-shadow 0.2s', cursor:'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.25)' }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
    >
      {/* Top row: product + status */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
          <div style={{
            width:40, height:40, borderRadius:10, flexShrink:0,
            background:`${catColor}18`, display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Shield size={19} color={catColor} />
          </div>
          <div>
            <div style={{ fontSize:'0.9rem', fontWeight:700, lineHeight:1.3 }}>{item.productName}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--color-muted)', marginTop:'0.15rem' }}>{item.merchantName}</div>
          </div>
        </div>
        {/* Status badge */}
        <div style={{
          display:'flex', alignItems:'center', gap:'0.35rem', flexShrink:0,
          padding:'0.25rem 0.6rem', borderRadius:6,
          background:cfg.bg, color:cfg.color,
          fontSize:'0.72rem', fontWeight:700,
        }}>
          <StatusIcon size={11} />
          {cfg.label}
        </div>
      </div>

      {/* Progress bar (days remaining) */}
      {item.status !== 'expired' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'0.3rem' }}>
            <span style={{ color:'var(--color-muted)' }}>Warranty remaining</span>
            <span style={{ color:cfg.color, fontWeight:600 }}>
              {item.daysRemaining > 0 ? `${item.daysRemaining} days left` : 'Expired'}
            </span>
          </div>
          <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
            {/* Cap bar at max 1825 days (5 years) for visual purposes */}
            <div style={{
              height:'100%', borderRadius:3,
              width:`${Math.min(100, Math.max(1, (item.daysRemaining / 1825) * 100))}%`,
              background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
              transition:'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {/* Dates row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
        {[
          { label:'Purchased',  value: formatDate(item.purchaseDate)       },
          { label:'Expires',    value: formatDate(item.warrantyExpiryDate) },
        ].map(d => (
          <div key={d.label} style={{
            background:'rgba(255,255,255,0.03)', borderRadius:8,
            padding:'0.5rem 0.75rem', border:'1px solid var(--color-border)',
          }}>
            <div style={{ fontSize:'0.68rem', color:'var(--color-muted)', marginBottom:'0.15rem' }}>{d.label}</div>
            <div style={{ fontSize:'0.8rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem' }}>
              <Calendar size={11} color='var(--color-muted)' />
              {d.value}
            </div>
          </div>
        ))}
      </div>

      {/* Coverage */}
      <div style={{
        background:'rgba(255,255,255,0.02)', borderRadius:8,
        padding:'0.6rem 0.75rem', border:'1px solid var(--color-border)',
        fontSize:'0.78rem', color:'var(--color-muted)', lineHeight:1.5,
      }}>
        {item.coverageDetails}
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{
          fontSize:'0.7rem', fontWeight:600, padding:'0.2rem 0.5rem', borderRadius:4,
          background:`${catColor}15`, color:catColor, border:`1px solid ${catColor}30`,
        }}>
          {item.category}
        </span>
        <a
          href={`/app/documents#${item.documentId}`}
          style={{ fontSize:'0.75rem', color:'var(--color-accent)', textDecoration:'none', display:'flex', alignItems:'center', gap:'0.3rem' }}
        >
          <FileText size={12} /> View document
        </a>
      </div>
    </div>
  )
}

export default function WarrantyTracker() {
  const [filter, setFilter] = useState<WarrantyStatus | 'All'>('All')

  const counts = {
    All:          MOCK_WARRANTIES.length,
    active:       MOCK_WARRANTIES.filter(w => w.status === 'active').length,
    expiring_soon:MOCK_WARRANTIES.filter(w => w.status === 'expiring_soon').length,
    expired:      MOCK_WARRANTIES.filter(w => w.status === 'expired').length,
  }

  const filtered = filter === 'All'
    ? MOCK_WARRANTIES
    : MOCK_WARRANTIES.filter(w => w.status === filter)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.25rem', margin:0 }}>Warranty Tracker</h2>
        <p style={{ color:'var(--color-muted)', fontSize:'0.83rem', margin:'0.2rem 0 0' }}>
          {counts.active} active · {counts.expiring_soon} expiring soon · {counts.expired} expired
        </p>
      </div>

      {/* Summary banner for expiring */}
      {counts.expiring_soon > 0 && (
        <div style={{
          background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.3)',
          borderRadius:12, padding:'1rem 1.25rem',
          display:'flex', gap:'0.75rem', alignItems:'center',
        }}>
          <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink:0 }} />
          <div style={{ fontSize:'0.85rem' }}>
            <strong style={{ color:'#fbbf24' }}>Action needed:</strong>
            {' '}{counts.expiring_soon} product{counts.expiring_soon > 1 ? 's' : ''} have warranties expiring in the next 30 days.
            Consider contacting the manufacturer or purchasing an extended plan.
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        {([
          { key:'All',           label:`All (${counts.All})`,                                   color:'#6c63ff' },
          { key:'active',        label:`✅ Active (${counts.active})`,                          color:'#22d3a1' },
          { key:'expiring_soon', label:`⚠️ Expiring Soon (${counts.expiring_soon})`,            color:'#fbbf24' },
          { key:'expired',       label:`❌ Expired (${counts.expired})`,                        color:'#f87171' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding:'0.45rem 1rem', borderRadius:8, fontSize:'0.8rem', cursor:'pointer',
              fontFamily:'var(--font-sans)',
              background: filter === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.04)',
              border:     filter === tab.key ? `1px solid ${tab.color}55` : '1px solid var(--color-border)',
              color:      filter === tab.key ? tab.color : 'var(--color-muted)',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'1rem' }}>
        {filtered.map(w => <WarrantyCard key={w.id} item={w} />)}
      </div>

      {filtered.length === 0 && (
        <div className="glass" style={{ borderRadius:16, padding:'3rem', textAlign:'center', color:'var(--color-muted)' }}>
          <Shield size={32} style={{ marginBottom:'0.75rem', opacity:0.4 }} />
          <div>No warranties in this category.</div>
        </div>
      )}
    </div>
  )
}
