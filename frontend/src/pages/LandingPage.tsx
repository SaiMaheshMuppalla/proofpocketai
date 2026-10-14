import { useNavigate } from 'react-router-dom'
import {
  Shield, Search, Brain, Bell, FileText,
  Upload, Star, CheckCircle, ArrowRight,
  Zap, Lock, BarChart3,
} from 'lucide-react'

// ─── Hero Section ──────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display:   'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '6rem 1.5rem 4rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position:'absolute', top:'15%', left:'10%',
        width:'400px', height:'400px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)',
        filter:'blur(40px)',
        animation:'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position:'absolute', bottom:'20%', right:'8%',
        width:'320px', height:'320px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)',
        filter:'blur(40px)',
        animation:'float 11s ease-in-out infinite reverse',
      }} />
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'600px', height:'600px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(34,211,161,0.05) 0%, transparent 65%)',
        filter:'blur(60px)',
        pointerEvents:'none',
      }} />

      {/* Badge */}
      <div className="animate-slide-up" style={{
        display:'inline-flex', alignItems:'center', gap:'0.5rem',
        background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.35)',
        borderRadius:'999px', padding:'0.4rem 1rem', marginBottom:'1.5rem',
        fontSize:'0.82rem', fontWeight:600, color:'var(--color-accent2)',
      }}>
        <Zap size={13} />
        AI-Powered Purchase Document Wallet
      </div>

      {/* Headline */}
      <h1 className="animate-slide-up" style={{
        fontFamily:'var(--font-display)',
        fontSize: 'clamp(2.5rem, 7vw, 5rem)',
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        maxWidth: '900px',
        marginBottom: '1.5rem',
        animationDelay: '0.1s',
      }}>
        Never lose a{' '}
        <span className="gradient-text">receipt, bill,</span>
        <br />
        or warranty again.
      </h1>

      {/* Sub-headline */}
      <p className="animate-slide-up" style={{
        color:'var(--color-muted)', fontSize:'clamp(1rem, 2.5vw, 1.2rem)',
        maxWidth:'600px', marginBottom:'2.5rem', lineHeight:1.7,
        animationDelay:'0.2s',
      }}>
        Upload any purchase document. Our AI extracts merchant, date, total, 
        items and warranty — and organises everything in your secure wallet.
      </p>

      {/* CTA row */}
      <div className="animate-slide-up" style={{
        display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center',
        marginBottom:'4rem', animationDelay:'0.3s',
      }}>
        <button
          className="btn-primary"
          id="hero-cta-start"
          onClick={() => navigate('/signup')}
          style={{ fontSize:'1rem', padding:'0.85rem 2rem' }}
        >
          Start for free <ArrowRight size={16} style={{ display:'inline', marginLeft:'0.4rem', verticalAlign:'middle' }} />
        </button>
        <button className="btn-outline" id="hero-cta-demo" style={{ fontSize:'1rem', padding:'0.85rem 2rem' }}>
          See how it works
        </button>
      </div>

      {/* Floating mini stats */}
      <div className="animate-fade-in" style={{
        display:'flex', gap:'2rem', flexWrap:'wrap', justifyContent:'center',
        animationDelay:'0.5s',
      }}>
        {[
          { label:'Documents stored', value:'0 data loss' },
          { label:'AI accuracy',      value:'95 %+' },
          { label:'Free tier',        value:'Always' },
        ].map(s => (
          <div key={s.label} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700, color:'var(--color-accent2)' }}>
              {s.value}
            </div>
            <div style={{ fontSize:'0.8rem', color:'var(--color-muted)', marginTop:'0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mock app card */}
      <div className="glass animate-float-slow" style={{
        marginTop:'4rem', borderRadius:'20px', padding:'1.5rem',
        maxWidth:'480px', width:'100%', textAlign:'left',
        boxShadow:'0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1rem' }}>
          {['#f87171','#fbbf24','#22d3a1'].map(c => (
            <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }} />
          ))}
        </div>
        {[
          { name:'Amazon Invoice — Oct 2026',   tag:'Electronics',  price:'₹24,999', color:'#6c63ff' },
          { name:'Reliance Smart Bill',          tag:'Groceries',    price:'₹1,240',  color:'#22d3a1' },
          { name:'Dell Laptop Warranty Card',    tag:'Warranty',     price:'3 yrs',   color:'#fbbf24' },
        ].map(d => (
          <div key={d.name} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0.7rem 0.8rem', borderRadius:'10px', marginBottom:'0.5rem',
            background:'rgba(255,255,255,0.03)', border:'1px solid var(--color-border)',
            transition:'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          >
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{
                width:34, height:34, borderRadius:8,
                background:`${d.color}22`, display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <FileText size={16} color={d.color} />
              </div>
              <div>
                <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{d.name}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--color-muted)', marginTop:'0.1rem' }}>{d.tag}</div>
              </div>
            </div>
            <div style={{ fontSize:'0.9rem', fontWeight:700, color:d.color }}>{d.price}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features Section ──────────────────────────────────────────
const features = [
  {
    icon: Brain,
    color: '#6c63ff',
    title: 'AI Data Extraction',
    description: 'Upload any receipt image or PDF. Gemini AI reads it and pulls out merchant name, date, total, line items, and warranty information automatically.',
  },
  {
    icon: Search,
    color: '#22d3a1',
    title: 'Instant Search',
    description: 'Full-text search across all your documents. Find any purchase by product name, store, price range, or date — in milliseconds.',
  },
  {
    icon: Bell,
    color: '#fbbf24',
    title: 'Warranty Alerts',
    description: 'Never let a warranty expire silently. ProofPocket notifies you 30 days before so you can claim service in time.',
  },
  {
    icon: Lock,
    color: '#a78bfa',
    title: 'Secure Wallet',
    description: 'Documents are stored encrypted in Supabase with row-level security — only you can see your data. No shared servers, no leaks.',
  },
  {
    icon: Shield,
    color: '#f87171',
    title: 'Fraud-Free Records',
    description: 'Every document gets a hash fingerprint. Instantly verify authenticity before submitting for insurance or warranty claims.',
  },
  {
    icon: BarChart3,
    color: '#34d399',
    title: 'Spending Insights',
    description: 'Visual breakdown of your spending by category, merchant, and month — extracted purely from your own purchase documents.',
  },
]

function Features() {
  return (
    <section id="features" style={{ padding:'6rem 1.5rem', maxWidth:'1200px', margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
        <div style={{
          display:'inline-block', fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.1em',
          color:'var(--color-accent)', textTransform:'uppercase', marginBottom:'0.75rem',
        }}>
          Everything you need
        </div>
        <h2 style={{
          fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)',
          fontWeight:800, letterSpacing:'-0.02em', marginBottom:'1rem',
        }}>
          Built for smart shoppers
        </h2>
        <p style={{ color:'var(--color-muted)', maxWidth:'520px', margin:'0 auto', lineHeight:1.7 }}>
          One app that replaces the shoebox of receipts, the spreadsheet of warranties, 
          and the worry of lost bills.
        </p>
      </div>

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
        gap:'1.5rem',
      }}>
        {features.map(f => (
          <div key={f.title} className="glass" style={{
            borderRadius:'16px', padding:'1.75rem',
            transition:'transform 0.25s ease, box-shadow 0.25s ease',
            cursor:'default',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${f.color}33`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          >
            <div style={{
              width:48, height:48, borderRadius:12,
              background:`${f.color}1a`, display:'flex', alignItems:'center', justifyContent:'center',
              marginBottom:'1.25rem',
            }}>
              <f.icon size={22} color={f.color} />
            </div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, marginBottom:'0.6rem' }}>
              {f.title}
            </h3>
            <p style={{ color:'var(--color-muted)', fontSize:'0.9rem', lineHeight:1.65 }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── How It Works ──────────────────────────────────────────────
const steps = [
  { icon: Upload,        step:'01', title:'Upload',  desc:'Drag & drop or take a photo of any purchase document — bill, invoice, warranty card, or receipt.' },
  { icon: Brain,         step:'02', title:'AI reads it', desc:'Gemini AI scans the document and extracts structured data: merchant, date, total, items, warranty.' },
  { icon: FileText,      step:'03', title:'Organised', desc:'Data is saved to your private Supabase wallet. You see a clean card with all extracted details.' },
  { icon: Bell,          step:'04', title:'Alerted',  desc:'Get notified before warranties expire, or search your wallet anytime from any device.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      padding:'6rem 1.5rem',
      background:'linear-gradient(180deg, transparent 0%, rgba(108,99,255,0.04) 50%, transparent 100%)',
    }}>
      <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div style={{
            display:'inline-block', fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.1em',
            color:'var(--color-accent)', textTransform:'uppercase', marginBottom:'0.75rem',
          }}>
            4 simple steps
          </div>
          <h2 style={{
            fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)',
            fontWeight:800, letterSpacing:'-0.02em',
          }}>
            How ProofPocket works
          </h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:'1.5rem' }}>
          {steps.map((s, i) => (
            <div key={s.step} style={{ textAlign:'center', position:'relative' }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position:'absolute', top:'2.2rem', left:'calc(50% + 2rem)', right:'-calc(50% - 2rem)',
                  height:'1px', background:'linear-gradient(90deg, var(--color-accent), transparent)',
                  display:'none',
                }} className="step-connector" />
              )}
              <div style={{
                width:64, height:64, borderRadius:16, margin:'0 auto 1.25rem',
                background:'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(167,139,250,0.12))',
                border:'1px solid rgba(108,99,255,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative',
              }}>
                <s.icon size={26} color='#a78bfa' />
                <div style={{
                  position:'absolute', top:-10, right:-10,
                  background:'var(--color-accent)', borderRadius:'999px',
                  width:22, height:22, fontSize:'0.65rem', fontWeight:800,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff',
                }}>
                  {i + 1}
                </div>
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'0.5rem' }}>{s.title}</h3>
              <p style={{ color:'var(--color-muted)', fontSize:'0.88rem', lineHeight:1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ────────────────────────────────────────────────
function CTABanner() {
  const navigate = useNavigate()
  return (
    <section id="about" style={{ padding:'5rem 1.5rem' }}>
      <div style={{
        maxWidth:'800px', margin:'0 auto', textAlign:'center',
        background:'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(167,139,250,0.08))',
        border:'1px solid rgba(108,99,255,0.3)',
        borderRadius:'24px', padding:'3.5rem 2rem',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', inset:0,
          background:'radial-gradient(circle at 50% -20%, rgba(108,99,255,0.25), transparent 70%)',
          pointerEvents:'none',
        }} />
        <div style={{ position:'relative' }}>
          <Star size={32} color='#fbbf24' style={{ marginBottom:'1rem' }} />
          <h2 style={{
            fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,4vw,2.4rem)',
            fontWeight:800, letterSpacing:'-0.02em', marginBottom:'1rem',
          }}>
            Your purchase history,<br />
            <span className="gradient-text">finally under control.</span>
          </h2>
          <p style={{ color:'var(--color-muted)', maxWidth:'440px', margin:'0 auto 2rem', lineHeight:1.7 }}>
            Built as a BTech AIML minor project using real AI, real database, 
            and real-world architecture. No fakes, no placeholders.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button
              className="btn-primary"
              id="cta-banner-start"
              onClick={() => navigate('/signup')}
              style={{ fontSize:'1rem', padding:'0.85rem 2rem' }}
            >
              Create free account
            </button>
            <button className="btn-outline" id="cta-banner-github" style={{ fontSize:'1rem', padding:'0.85rem 2rem' }}>
              View on GitHub
            </button>
          </div>
          <div style={{
            display:'flex', gap:'1.5rem', justifyContent:'center', marginTop:'2rem', flexWrap:'wrap',
          }}>
            {['No credit card required','Open source','Built with FastAPI + React'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.83rem', color:'var(--color-muted)' }}>
                <CheckCircle size={14} color='var(--color-success)' /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop:'1px solid var(--color-border)', padding:'2rem 1.5rem',
      textAlign:'center', color:'var(--color-muted)', fontSize:'0.85rem',
    }}>
      <p>
        © 2026 ProofPocket AI · Built by <strong style={{ color:'var(--color-accent2)' }}>Muppalla Sai Mahesh</strong>
        {' · '}BTech AIML Minor Project
      </p>
    </footer>
  )
}

// ─── Page export ──────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </>
  )
}
