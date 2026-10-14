import { useState } from 'react'
import { FileText, Image, Search, CheckCircle, Clock, XCircle, Upload } from 'lucide-react'
import { MOCK_DOCUMENTS, formatDate, type DocStatus } from '../data/mockData'

const STATUS_CONFIG: Record<DocStatus, { label:string; color:string; icon: React.ElementType }> = {
  processed: { label:'Processed', color:'#22d3a1', icon:CheckCircle },
  pending:   { label:'Processing', color:'#fbbf24', icon:Clock      },
  failed:    { label:'Failed',     color:'#f87171', icon:XCircle    },
}

export default function Documents() {
  const [search,    setSearch]    = useState('')
  const [statusFil, setStatus]    = useState<DocStatus | 'All'>('All')
  const [viewMode,  setViewMode]  = useState<'grid' | 'list'>('grid')

  const filtered = MOCK_DOCUMENTS.filter(d =>
    (statusFil === 'All' || d.status === statusFil) &&
    d.fileName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.25rem', margin:0 }}>Documents</h2>
          <p style={{ color:'var(--color-muted)', fontSize:'0.83rem', margin:'0.2rem 0 0' }}>
            {filtered.length} of {MOCK_DOCUMENTS.length} documents
          </p>
        </div>
        {/* Grid / list toggle */}
        <div style={{ display:'flex', gap:'0.4rem' }}>
          {(['grid','list'] as const).map(m => (
            <button key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding:'0.4rem 0.85rem', borderRadius:8, fontSize:'0.8rem', cursor:'pointer',
                fontFamily:'var(--font-sans)',
                background: viewMode === m ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                border:     viewMode === m ? '1px solid rgba(108,99,255,0.4)' : '1px solid var(--color-border)',
                color:      viewMode === m ? '#a78bfa' : 'var(--color-muted)',
              }}
            >
              {m === 'grid' ? '⊞ Grid' : '☰ List'}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass" style={{ borderRadius:12, padding:'0.75rem 1rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'180px' }}>
          <Search size={14} style={{ position:'absolute', left:'0.65rem', top:'50%', transform:'translateY(-50%)', color:'var(--color-muted)', pointerEvents:'none' }} />
          <input
            id="docs-search"
            type="text"
            placeholder="Search file name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--color-border)',
              borderRadius:8, padding:'0.4rem 0.75rem 0.4rem 2rem', color:'var(--color-text)',
              fontSize:'0.83rem', outline:'none', fontFamily:'var(--font-sans)',
            }}
          />
        </div>
        {/* Status filters */}
        {(['All', 'processed', 'pending', 'failed'] as const).map(s => {
          const cfg = s !== 'All' ? STATUS_CONFIG[s] : null
          return (
            <button key={s}
              onClick={() => setStatus(s)}
              style={{
                padding:'0.3rem 0.7rem', borderRadius:6, fontSize:'0.75rem', cursor:'pointer',
                fontFamily:'var(--font-sans)',
                background: statusFil === s ? `${cfg?.color ?? '#6c63ff'}22` : 'rgba(255,255,255,0.03)',
                border:     statusFil === s ? `1px solid ${cfg?.color ?? '#6c63ff'}55` : '1px solid var(--color-border)',
                color:      statusFil === s ? (cfg?.color ?? '#a78bfa') : 'var(--color-muted)',
              }}
            >
              {s === 'All' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          )
        })}
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ borderRadius:16, padding:'3rem', textAlign:'center', color:'var(--color-muted)' }}>
          <FileText size={32} style={{ marginBottom:'0.75rem', opacity:0.4 }} />
          <div>No documents found.</div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem' }}>
          {filtered.map(doc => {
            const cfg = STATUS_CONFIG[doc.status]
            const StatusIcon = cfg.icon
            return (
              <div key={doc.id} className="glass" style={{
                borderRadius:14, padding:'1.25rem',
                display:'flex', flexDirection:'column', gap:'0.75rem',
                transition:'transform 0.2s, box-shadow 0.2s', cursor:'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
              >
                {/* Preview area */}
                <div style={{
                  height:80, borderRadius:8, background:'rgba(108,99,255,0.08)',
                  border:'1px solid rgba(108,99,255,0.15)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'2.2rem',
                }}>
                  {doc.previewEmoji}
                </div>
                {/* Info */}
                <div>
                  <div style={{ fontSize:'0.82rem', fontWeight:600, lineHeight:1.3, wordBreak:'break-word' }}>
                    {doc.fileName}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--color-muted)', marginTop:'0.25rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    {doc.fileType === 'pdf' ? <FileText size={11} /> : <Image size={11} />}
                    {doc.fileType.toUpperCase()} · {doc.sizekb} KB
                  </div>
                </div>
                {/* Status + date */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:'0.3rem',
                    fontSize:'0.7rem', fontWeight:600, color:cfg.color,
                  }}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </div>
                  <div style={{ fontSize:'0.7rem', color:'var(--color-muted)' }}>{formatDate(doc.uploadedAt)}</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="glass" style={{ borderRadius:16, overflow:'hidden' }}>
          <div style={{
            display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 1fr',
            padding:'0.65rem 1.25rem', borderBottom:'1px solid var(--color-border)',
            fontSize:'0.72rem', color:'var(--color-muted)', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'0.05em',
          }}>
            <span>File Name</span><span>Type</span><span>Uploaded</span><span>Status</span>
          </div>
          {filtered.map((doc, i) => {
            const cfg = STATUS_CONFIG[doc.status]
            const StatusIcon = cfg.icon
            return (
              <div key={doc.id} style={{
                display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 1fr',
                padding:'0.8rem 1.25rem', alignItems:'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(42,45,62,0.5)' : 'none',
                transition:'background 0.15s', cursor:'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{
                    width:36, height:36, borderRadius:8, flexShrink:0,
                    background:'rgba(108,99,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem',
                  }}>
                    {doc.previewEmoji}
                  </div>
                  <div style={{ fontSize:'0.84rem', fontWeight:500, wordBreak:'break-word' }}>{doc.fileName}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.8rem', color:'var(--color-muted)' }}>
                  {doc.fileType === 'pdf' ? <FileText size={13} /> : <Image size={13} />}
                  {doc.fileType.toUpperCase()}
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--color-muted)' }}>{formatDate(doc.uploadedAt)}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.78rem', fontWeight:600, color:cfg.color }}>
                  <StatusIcon size={13} /> {cfg.label}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload placeholder */}
      <div style={{
        border:'2px dashed var(--color-border)', borderRadius:16,
        padding:'2rem', textAlign:'center', cursor:'pointer', transition:'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#6c63ff')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        <Upload size={28} color='var(--color-muted)' style={{ marginBottom:'0.5rem' }} />
        <div style={{ fontSize:'0.88rem', fontWeight:600, marginBottom:'0.25rem' }}>Drop a receipt or invoice here</div>
        <div style={{ fontSize:'0.78rem', color:'var(--color-muted)' }}>JPG, PNG, PDF · Upload coming in Phase 3</div>
      </div>
    </div>
  )
}
