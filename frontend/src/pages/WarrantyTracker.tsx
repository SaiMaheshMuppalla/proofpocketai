import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Phone,
  HelpCircle,
  Edit3,
  Building,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchUserProducts,
  type ProductRecord,
  formatDisplayDate,
  calculateWarrantyStatus,
  getDaysRemaining,
} from '../lib/database'
import EditProductModal from '../components/EditProductModal'
import AddProductModal from '../components/AddProductModal'

type FilterTab = 'all' | 'active' | 'expiring_soon' | 'expired' | 'unknown'

export default function WarrantyTracker() {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const records = await fetchUserProducts(user.id)
      setProducts(records)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch warranties')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Global listener for product updates
  useEffect(() => {
    const handleRefresh = () => loadData()
    window.addEventListener('proofpocket:product-added', handleRefresh)
    window.addEventListener('proofpocket:product-updated', handleRefresh)
    return () => {
      window.removeEventListener('proofpocket:product-added', handleRefresh)
      window.removeEventListener('proofpocket:product-updated', handleRefresh)
    }
  }, [loadData])

  // Status mapping
  const itemsWithStatus = products.map((p) => {
    const status = calculateWarrantyStatus(p.warranty_expiry_date)
    const daysRemaining = getDaysRemaining(p.warranty_expiry_date)
    return { product: p, status, daysRemaining }
  })

  const counts = {
    all: products.length,
    active: itemsWithStatus.filter((i) => i.status === 'active').length,
    expiring_soon: itemsWithStatus.filter((i) => i.status === 'expiring_soon').length,
    expired: itemsWithStatus.filter((i) => i.status === 'expired').length,
    unknown: itemsWithStatus.filter((i) => i.status === 'unknown').length,
  }

  // Filtered items
  const filtered = itemsWithStatus.filter((item) => {
    if (activeTab === 'all') return true
    return item.status === activeTab
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 800,
              color: 'var(--color-accent)',
            }}
          >
            Protection Radar
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
            Warranty Tracker
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--color-muted)',
              margin: 0,
            }}
          >
            {isLoading
              ? 'Analyzing coverage schedules…'
              : `${counts.active} active warranties · ${counts.expiring_soon} expiring soon · ${counts.expired} expired`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => loadData()}
            className="btn-editorial-ghost"
            style={{ padding: '0.65rem 1rem' }}
            title="Refresh warranty data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-coral"
            style={{ padding: '0.65rem 1.35rem' }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* ── Expiring Soon Warning Banner ───────────────────────── */}
      {counts.expiring_soon > 0 && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: '#92400E',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} color="#D97706" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.15rem' }}>
              Warranty Expiration Notice ({counts.expiring_soon} Product{counts.expiring_soon > 1 ? 's' : ''})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#B45309' }}>
              These warranties expire within 30 days. Schedule any pending service checks, lodge claims, or explore extended
              warranty coverage now before policy windows close.
            </div>
          </div>
        </div>
      )}

      {/* ── Status Metrics Bar ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          { key: 'all' as FilterTab, label: 'All Products', count: counts.all, icon: Shield, color: 'var(--color-text)' },
          { key: 'active' as FilterTab, label: 'Active Protection', count: counts.active, icon: ShieldCheck, color: '#059669' },
          { key: 'expiring_soon' as FilterTab, label: 'Expiring Soon', count: counts.expiring_soon, icon: AlertTriangle, color: '#D97706' },
          { key: 'expired' as FilterTab, label: 'Expired', count: counts.expired, icon: ShieldX, color: '#DC2626' },
          { key: 'unknown' as FilterTab, label: 'Unspecified', count: counts.unknown, icon: HelpCircle, color: 'var(--color-muted)' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key
          const Icon = tab.icon
          return (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="card-editorial"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'rgba(240, 68, 56, 0.04)' : 'var(--color-surface)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-muted)' }}>{tab.label}</span>
                <Icon size={18} color={tab.color} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: tab.color,
                  marginTop: '0.5rem',
                }}
              >
                {tab.count}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Loading State ───────────────────────────────────────── */}
      {isLoading && products.length === 0 && (
        <div
          className="card-editorial"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-accent)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            Loading Warranty Ledger
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', margin: 0 }}>
            Validating dates and calculating live expiry timers…
          </p>
        </div>
      )}

      {/* ── Genuine Empty State (0 products in database) ────────── */}
      {!isLoading && products.length === 0 && !error && (
        <div
          className="card-editorial"
          style={{
            padding: '4.5rem 2.5rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <Shield size={28} color="var(--color-accent)" />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--color-text)',
              marginBottom: '0.6rem',
            }}
          >
            No warranties tracked yet.
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-muted)',
              lineHeight: 1.6,
              maxWidth: '480px',
              margin: '0 auto 1.75rem',
            }}
          >
            ProofPocket AI safeguards your consumer rights. Add a product with its warranty duration or expiration date to
            unlock active countdowns and claim alerts.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-coral"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            <Plus size={18} />
            <span>Add Your First Product</span>
          </button>
        </div>
      )}

      {/* ── Filter Miss (Products exist, but current tab is empty) ── */}
      {!isLoading && products.length > 0 && filtered.length === 0 && (
        <div
          className="card-editorial"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
          }}
        >
          <ShieldCheck size={36} color="var(--color-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
            }}
          >
            No products in this warranty category
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            There are currently no items matching the “{activeTab}” filter.
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="btn-editorial-ghost"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            View All Products
          </button>
        </div>
      )}

      {/* ── Cards Grid ─────────────────────────────────────────── */}
      {!isLoading && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map(({ product, status, daysRemaining }) => {
            const hasDates = !!product.warranty_expiry_date

            return (
              <div
                key={product.id}
                className="card-editorial"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.15rem',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedProduct(product)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(75, 33, 27, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Card Header: Product & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 800,
                        color: 'var(--color-muted)',
                      }}
                    >
                      {product.brand || product.category || 'General'}
                    </span>
                    <h3
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 800,
                        fontSize: '1.15rem',
                        lineHeight: 1.25,
                        color: 'var(--color-text)',
                        margin: '0.2rem 0 0',
                      }}
                    >
                      {product.product_name}
                    </h3>
                    {product.model && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Model: {product.model}</span>
                    )}
                  </div>

                  <div>
                    {status === 'active' && <span className="pill-active">Active</span>}
                    {status === 'expiring_soon' && <span className="pill-expiring">Expiring Soon</span>}
                    {status === 'expired' && <span className="pill-expired">Expired</span>}
                    {status === 'unknown' && <span className="pill-unknown">Unspecified</span>}
                  </div>
                </div>

                {/* Days remaining badge / banner */}
                {hasDates && daysRemaining !== null && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      backgroundColor:
                        status === 'expired'
                          ? '#FEF2F2'
                          : status === 'expiring_soon'
                          ? '#FFFBEB'
                          : '#ECFDF5',
                      border: `1px solid ${
                        status === 'expired'
                          ? '#FCA5A5'
                          : status === 'expiring_soon'
                          ? '#FDE68A'
                          : '#A7F3D0'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontWeight: 600,
                        color:
                          status === 'expired'
                            ? '#991B1B'
                            : status === 'expiring_soon'
                            ? '#92400E'
                            : '#065F46',
                      }}
                    >
                      <Clock size={14} />
                      {daysRemaining > 0
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0
                        ? 'Expires today'
                        : `Expired ${Math.abs(daysRemaining)} days ago`}
                    </span>
                    {(product.warranty_duration_months || product.warranty_duration) && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        {product.warranty_duration_months || product.warranty_duration} mo term
                      </span>
                    )}
                  </div>
                )}

                {/* Important Dates */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Purchased
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        marginTop: '0.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Calendar size={12} color="var(--color-muted)" />
                      {formatDisplayDate(product.purchase_date)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Expires
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: status === 'expired' ? '#DC2626' : 'var(--color-text)',
                        marginTop: '0.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Calendar size={12} color={status === 'expired' ? '#DC2626' : 'var(--color-muted)'} />
                      {formatDisplayDate(product.warranty_expiry_date)}
                    </div>
                  </div>
                </div>

                {/* Provider & Return Deadline */}
                {(product.warranty_provider || product.return_deadline || product.service_contact) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
                    {product.warranty_provider && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-muted)' }}>
                        <Building size={13} />
                        <span>
                          Provider: <strong style={{ color: 'var(--color-text)' }}>{product.warranty_provider}</strong>
                        </span>
                      </div>
                    )}
                    {product.return_deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-muted)' }}>
                        <Clock size={13} />
                        <span>
                          Return Deadline:{' '}
                          <strong style={{ color: 'var(--color-accent)' }}>
                            {formatDisplayDate(product.return_deadline)}
                          </strong>
                        </span>
                      </div>
                    )}
                    {product.service_contact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-muted)' }}>
                        <Phone size={13} />
                        <span>Support: {product.service_contact}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Action footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '0.85rem',
                    marginTop: 'auto',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    {product.serial_number ? `S/N: ${product.serial_number}` : 'Verified record'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(product)
                    }}
                    className="btn-editorial-ghost"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <Edit3 size={12} />
                    <span>Manage Details</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Edit Product Modal ──────────────────────────────────── */}
      {selectedProduct && (
        <EditProductModal
          isOpen={true}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            setSelectedProduct(null)
            loadData()
          }}
        />
      )}

      {/* ── Add Product Modal ───────────────────────────────────── */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          loadData()
        }}
      />
    </div>
  )
}
