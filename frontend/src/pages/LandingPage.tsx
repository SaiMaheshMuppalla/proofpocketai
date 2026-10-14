import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Clock,
  ArrowRight,
  Lock,
  Calendar,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section
        style={{
          padding: '8.5rem 1.5rem 5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Editorial Pill Label */}
        <div
          className="animate-slide-up"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            padding: '0.4rem 1.1rem',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 8px rgba(56, 26, 22, 0.04)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
            }}
          />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-text)',
            }}
          >
            What's Hot in Receipt & Warranty Care 2026
          </span>
        </div>

        {/* Expressive Editorial Headline */}
        <h1
          className="animate-slide-up"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            lineHeight: 1.08,
            color: 'var(--color-text)',
            letterSpacing: '-0.03em',
            maxWidth: '920px',
            margin: '0 auto 1.5rem',
          }}
        >
          Every product you own,{' '}
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--color-accent)',
            }}
          >
            backed by permanent proof.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-slide-up"
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--color-muted)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Never scramble for faded receipts or miss an expensive warranty deadline again.
          ProofPocket AI safeguards your purchase bills, tracks active coverage, and organizes every product in one elegant wallet.
        </p>

        {/* Call to Actions */}
        <div
          className="animate-slide-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '4.5rem',
          }}
        >
          <button
            onClick={() => navigate('/signup')}
            className="btn-coral"
            style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
          >
            Create Your Free Pocket <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-editorial-ghost"
            style={{ fontSize: '1rem', padding: '0.85rem 1.8rem' }}
          >
            Sign in to Existing Wallet
          </button>
        </div>

        {/* ─── Hero Editorial Cards Composition ─────────────────────── */}
        <div
          className="animate-slide-up"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
          }}
        >
          {/* Card 1: Active Warranty */}
          <div className="card-editorial card-editorial-hover" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span className="pill-badge pill-active">Active • 284 Days Left</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600 }}>Apple Care+</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
              MacBook Pro 14" M3 Max
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>
              Purchased from Apple Store BKC • ₹2,49,900
            </p>
            <div
              style={{
                backgroundColor: 'var(--color-surface-soft)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Expires On</span>
                <strong style={{ color: 'var(--color-text)' }}>Oct 24, 2027</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Receipt</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Attached (PDF)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Expiring Soon Alert */}
          <div
            className="card-editorial card-editorial-hover"
            style={{
              padding: '1.75rem',
              border: '1.5px solid var(--color-warning-border)',
              backgroundColor: '#FFFDF7',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span className="pill-badge pill-expiring">Expiring Soon • 12 Days Left</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-warning)', fontWeight: 700 }}>Claim Window Closing</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
              Sony WH-1000XM5 Headphones
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>
              Purchased on Amazon India • ₹29,990
            </p>
            <div
              style={{
                backgroundColor: 'var(--color-warning-bg)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                border: '1px solid var(--color-warning-border)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                Service Center: 1800-103-7799
              </span>
              <span className="pill-badge" style={{ backgroundColor: '#FFFFFF', color: 'var(--color-warning)' }}>
                Action Needed
              </span>
            </div>
          </div>

          {/* Card 3: Instant AI Ingestion */}
          <div className="card-editorial card-editorial-hover" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span className="pill-badge pill-coral">AI Extracted</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600 }}>Tax Invoice</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
              Dyson V15 Cordless Vacuum
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.86rem', margin: '0 0 1.25rem' }}>
              Croma Electronics • Serial: #DY-881290-B
            </p>
            <div
              style={{
                backgroundColor: 'var(--color-surface-soft)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Coverage</span>
                <strong style={{ color: 'var(--color-text)' }}>2 Years Manufacturer</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Return Date</span>
                <span style={{ color: 'var(--color-muted)', fontWeight: 600 }}>Expired (30d)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Editorial Feature Section 1 ─────────────────────────────── */}
      <section
        id="features"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '6rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem' }}>
            <span
              style={{
                color: 'var(--color-accent)',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Core Philosophy
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                color: 'var(--color-text)',
                margin: '0 0 1rem',
                lineHeight: 1.15,
              }}
            >
              Built to protect the purchases you worked hard to afford.
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem', margin: 0 }}>
              Physical thermal paper fades after six months. Brands reject warranty claims without proof.
              ProofPocket AI fixes this permanently.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Feature 1 */}
            <div style={{ padding: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  marginBottom: '1.25rem',
                }}
              >
                <Calendar size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                Accurate Expiry Math
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Never guess an expiry date. Enter purchase date and warranty duration, and ProofPocket calculates the exact date with calendar-accurate leap and month offsets.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  marginBottom: '1.25rem',
                }}
              >
                <Clock size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                Expiring Soon Radar
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Get an organized view of warranties expiring within 30 days. Service minor defects, claim manufacturer fixes, and exercise return windows before coverage lapses.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  marginBottom: '1.25rem',
                }}
              >
                <Lock size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                Private Supabase Vault
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                Your financial records and purchase proofs stay private. Row-Level Security ensures only your authenticated user account can view, download, or edit your items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Editorial Step-By-Step ──────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem' }}>
          <span
            style={{
              color: 'var(--color-accent)',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            How It Works
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--color-text)',
              margin: '0 0 1rem',
              lineHeight: 1.15,
            }}
          >
            Three steps from purchase to total peace of mind.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Step 1 */}
          <div className="card-editorial" style={{ padding: '2rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--color-accent)',
                display: 'block',
                marginBottom: '1rem',
                lineHeight: 1,
              }}
            >
              01
            </span>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: '0 0 0.75rem' }}>
              Add Product & Warranty
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Enter product details, price, category, and warranty duration in months or years. All optional fields remain strictly optional.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card-editorial" style={{ padding: '2rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--color-accent)',
                display: 'block',
                marginBottom: '1rem',
                lineHeight: 1,
              }}
            >
              02
            </span>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: '0 0 0.75rem' }}>
              Attach Receipt or Invoice
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Upload your receipt (PDF, PNG, JPG). It is encrypted in your private Supabase storage bucket, safely linked to your product.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card-editorial" style={{ padding: '2rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: 'var(--color-accent)',
                display: 'block',
                marginBottom: '1rem',
                lineHeight: 1,
              }}
            >
              03
            </span>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', margin: '0 0 0.75rem' }}>
              Track & Claim Confidently
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Review active vs expiring warranties at a glance. Find repair contacts, serial numbers, and authentic proof in one tap whenever you need service.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Editorial Call to Action ─────────────────────────────────── */}
      <section
        style={{
          padding: '6rem 1.5rem',
          backgroundColor: 'var(--color-text)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              margin: '0 0 1.25rem',
              lineHeight: 1.15,
              fontWeight: 400,
            }}
          >
            Start your purchase wallet{' '}
            <span style={{ fontStyle: 'italic', color: '#F87171' }}>today.</span>
          </h2>
          <p style={{ color: '#D5C7B6', fontSize: '1.1rem', margin: '0 auto 2.5rem', maxWidth: '580px', lineHeight: 1.6 }}>
            Free for all personal devices, appliances, and retail purchases. Keep what matters safe.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="btn-coral"
            style={{ fontSize: '1rem', padding: '0.85rem 2.2rem' }}
          >
            Create Your Account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: '3rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.88rem',
          color: 'var(--color-muted)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={15} color="#FFFFFF" />
          </div>
          <strong style={{ color: 'var(--color-text)' }}>ProofPocket AI</strong>
          <span>• Editorial Warranty Wallet</span>
        </div>

        <div>
          <span>Crafted for BTech AIML Minor Project by </span>
          <strong style={{ color: 'var(--color-text)' }}>Muppalla Sai Mahesh</strong>
        </div>
      </footer>
    </div>
  )
}
