import { useState } from 'react'
import {
  User,
  Shield,
  Database,
  Lock,
  LogOut,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [currency, setCurrency] = useState('INR')
  const [alertDays, setAlertDays] = useState('30')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('proofpocket:preferred_currency', currency)
    localStorage.setItem('proofpocket:alert_days', alertDays)
    setSaveMsg('Preferences saved successfully.')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 800,
            color: 'var(--color-accent)',
          }}
        >
          Preferences & Security
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 900,
            lineHeight: 1.15,
            color: 'var(--color-text)',
            margin: '0.2rem 0 0.5rem',
          }}
        >
          Account Settings
        </h1>
        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--color-muted)',
            margin: 0,
          }}
        >
          Manage your account profile, vault encryption parameters, and notification tolerances.
        </p>
      </div>

      {/* ── Profile Details Card ───────────────────────────────── */}
      <div className="card-editorial" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
            }}
          >
            <User size={22} color="var(--color-accent)" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              Account Identity
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>
              Authenticated via Supabase JWT
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
              Email Address
            </label>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              {user?.email || 'Authenticated User'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
              User UID (Database Primary Key)
            </label>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                color: 'var(--color-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={user?.id}
            >
              {user?.id || 'Unknown UID'}
            </div>
          </div>
        </div>
      </div>

      {/* ── System & Security Infrastructure ──────────────────── */}
      <div className="card-editorial" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
            }}
          >
            <Database size={22} color="var(--color-accent)" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              Database & Security Architecture
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>
              Infrastructure status and isolation policies
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={18} color="#059669" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                  Supabase Client Configuration
                </strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  {isSupabaseConfigured ? 'Active & connected' : 'Local fallback'}
                </div>
              </div>
            </div>
            <span className="pill-active">Verified</span>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} color="#059669" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                  Row Level Security (RLS) Isolation
                </strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  All table reads, writes, and deletes enforce auth.uid() = user_id
                </div>
              </div>
            </div>
            <span className="pill-active">Enforced</span>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={18} color="#059669" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                  Private Document Storage
                </strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  Receipts accessible exclusively via ephemeral 1-hour signed tokens
                </div>
              </div>
            </div>
            <span className="pill-active">Private</span>
          </div>
        </div>
      </div>

      {/* ── Preferences Form ───────────────────────────────────── */}
      <form onSubmit={handleSavePreferences} className="card-editorial" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
            }}
          >
            <Clock size={22} color="var(--color-accent)" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              Preferences & Thresholds
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>
              Customize formatting and expiring warranty alert windows
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Primary Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            >
              <option value="INR">INR (₹ Indian Rupee)</option>
              <option value="USD">USD ($ US Dollar)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="GBP">GBP (£ British Pound)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              “Expiring Soon” Threshold
            </label>
            <select
              value={alertDays}
              onChange={(e) => setAlertDays(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            >
              <option value="15">15 days before expiry</option>
              <option value="30">30 days before expiry (Standard)</option>
              <option value="60">60 days before expiry</option>
              <option value="90">90 days before expiry</option>
            </select>
          </div>
        </div>

        {saveMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle size={16} />
            <span>{saveMsg}</span>
          </div>
        )}

        <button type="submit" className="btn-coral" style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}>
          Save Preferences
        </button>
      </form>

      {/* ── Sign Out Danger Zone ───────────────────────────────── */}
      <div
        className="card-editorial"
        style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFF5F5',
          borderColor: '#FED7D7',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#991B1B',
              margin: 0,
            }}
          >
            Sign Out of Vault
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#B91C1C', margin: '0.2rem 0 0' }}>
            Safely terminate your authenticated session on this browser.
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="btn-editorial-ghost"
          style={{
            borderColor: '#F87171',
            color: '#991B1B',
            padding: '0.65rem 1.25rem',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
