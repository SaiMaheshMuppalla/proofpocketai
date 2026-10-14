import { useState } from 'react'
import { Search, Filter, ShoppingBag } from 'lucide-react'
import {
  MOCK_PURCHASES, CATEGORY_COLORS, CATEGORY_EMOJIS,
  formatINR, formatDate, type Category,
} from '../data/mockData'

const ALL_CATEGORIES: Category[] = [
  'Electronics','Groceries','Clothing','Appliances','Furniture','Travel','Healthcare','Books',
]

export default function MyPurchases() {
  const [search, setSearch]   = useState('')
  const [catFilter, setCat]   = useState<Category | 'All'>('All')
  const [sortBy, setSort]     = useState<'date' | 'amount'>('date')

  const filtered = MOCK_PURCHASES
    .filter(p =>
      (catFilter === 'All' || p.category === catFilter) &&
      (p.merchantName.toLowerCase().includes(search.toLowerCase()) ||
       p.tags.some(t => t.includes(search.toLowerCase())))
    )
    .sort((a, b) =>
      sortBy === 'date'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : b.total - a.total
    )

  const totalShown = filtered.reduce((s, p) => s + p.total, 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.25rem', margin:0 }}>My Purchases</h2>
          <p style={{ color:'var(--color-muted)', fontSize:'0.83rem', margin:'0.2rem 0 0' }}>
            {filtered.length} purchases · {formatINR(totalShown)} total
          </p>
        </div>
        {/* Sort toggle */}
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {(['date','amount'] as const).map(s => (
            <button key={s}
              onClick={() => setSort(s)}
              style={{
                padding:'0.4rem 0.9rem', borderRadius:8, fontSize:'0.8rem', cursor:'pointer',
                fontFamily:'var(--font-sans)', fontWeight: sortBy === s ? 600 : 400,
                background: sortBy === s ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                border:     sortBy === s ? '1px solid rgba(108,99,255,0.4)' : '1px solid var(--color-border)',
                color:      sortBy === s ? '#a78bfa' : 'var(--color-muted)',
                transition: 'all 0.15s',
              }}
            >
              {s === 'date' ? 'Latest first' : 'Highest first'}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="glass" style={{ borderRadius:12, padding:'0.75rem 1rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'180px' }}>
          <Search size={14} style={{ position:'absolute', left:'0.65rem', top:'50%', transform:'translateY(-50%)', color:'var(--color-muted)', pointerEvents:'none' }} />
          <input
            id="purchases-search"
            type="text"
            placeholder="Search merchant or tag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--color-border)',
              borderRadius:8, padding:'0.4rem 0.75rem 0.4rem 2rem', color:'var(--color-text)',
              fontSize:'0.83rem', outline:'none', fontFamily:'var(--font-sans)',
            }}
          />
        </div>
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
          <Filter size={14} color='var(--color-muted)' />
          {(['All', ...ALL_CATEGORIES] as const).map(c => (
            <button key={c}
              onClick={() => setCat(c)}
              style={{
                padding:'0.3rem 0.7rem', borderRadius:6, fontSize:'0.75rem', cursor:'pointer',
                fontFamily:'var(--font-sans)',
                background: catFilter === c ? `${CATEGORY_COLORS[c as Category] ?? '#6c63ff'}22` : 'rgba(255,255,255,0.03)',
                border:     catFilter === c ? `1px solid ${CATEGORY_COLORS[c as Category] ?? '#6c63ff'}55` : '1px solid var(--color-border)',
                color:      catFilter === c ? (CATEGORY_COLORS[c as Category] ?? '#a78bfa') : 'var(--color-muted)',
                transition: 'all 0.15s',
              }}
            >
              {c === 'All' ? 'All' : `${CATEGORY_EMOJIS[c as Category]} ${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase table */}
      <div className="glass" style={{ borderRadius:16, overflow:'hidden' }}>
        {/* Table header */}
        <div style={{
          display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto',
          padding:'0.75rem 1.25rem', borderBottom:'1px solid var(--color-border)',
          fontSize:'0.75rem', color:'var(--color-muted)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase',
        }}>
          <span>Merchant</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Items</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'var(--color-muted)', fontSize:'0.88rem' }}>
            <ShoppingBag size={32} style={{ marginBottom:'0.75rem', opacity:0.4 }} />
            <div>No purchases match your search.</div>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p.id}
              style={{
                display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto',
                padding:'0.85rem 1.25rem', alignItems:'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none',
                transition:'background 0.15s',
                cursor:'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Merchant */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{
                  width:38, height:38, borderRadius:9, flexShrink:0,
                  background:`${CATEGORY_COLORS[p.category]}1a`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.1rem',
                }}>
                  {CATEGORY_EMOJIS[p.category]}
                </div>
                <div>
                  <div style={{ fontSize:'0.88rem', fontWeight:600 }}>{p.merchantName}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--color-muted)' }}>
                    {p.tags.map(t => `#${t}`).join(' ')}
                  </div>
                </div>
              </div>
              {/* Category badge */}
              <div>
                <span style={{
                  fontSize:'0.72rem', fontWeight:600, padding:'0.2rem 0.55rem', borderRadius:4,
                  background:`${CATEGORY_COLORS[p.category]}18`,
                  color: CATEGORY_COLORS[p.category],
                  border:`1px solid ${CATEGORY_COLORS[p.category]}33`,
                }}>
                  {p.category}
                </span>
              </div>
              {/* Date */}
              <div style={{ fontSize:'0.83rem', color:'var(--color-muted)' }}>{formatDate(p.date)}</div>
              {/* Amount */}
              <div style={{ fontSize:'0.9rem', fontWeight:700, color:CATEGORY_COLORS[p.category] }}>
                {formatINR(p.total)}
              </div>
              {/* Item count */}
              <div style={{ fontSize:'0.8rem', color:'var(--color-muted)', textAlign:'right' }}>
                {p.itemCount} item{p.itemCount !== 1 ? 's' : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
