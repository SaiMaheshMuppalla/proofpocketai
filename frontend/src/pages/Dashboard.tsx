import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Plus,
  Upload,
  RefreshCw,
  AlertCircle,
  Edit2,
  FolderOpen,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchUserProducts,
  formatCurrency,
  getDaysRemaining,
  type ProductRecord,
} from '../lib/database'
import AddProductModal from '../components/AddProductModal'
import EditProductModal from '../components/EditProductModal'

export default function Dashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null)

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const data = await fetchUserProducts(user.id)
      setProducts(data)
      setLoading(false)
    } catch (err: unknown) {
      setLoading(false)
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to connect to Supabase database. Please try again.'
      )
    }
  }, [user])

  useEffect(() => {
    loadData()

    // Listen for global product-added events from TopBar or Sidebar
    const handleGlobalAdd = () => loadData()
    window.addEventListener('proofpocket:product-added', handleGlobalAdd)
    return () => window.removeEventListener('proofpocket:product-added', handleGlobalAdd)
  }, [loadData])

  // Calculated real statistics
  const totalProducts = products.length
  const activeWarranties = products.filter((p) => p.warranty_status === 'active').length
  const expiringSoon = products.filter((p) => p.warranty_status === 'expiring_soon').length
  const expiredWarranties = products.filter((p) => p.warranty_status === 'expired').length
  const missingWarranty = products.filter((p) => p.warranty_status === 'unknown').length
  const totalSpending = products.reduce((acc, p) => acc + (p.amount || 0), 0)

  // Items expiring within 30 days
  const expiringItems = products
    .filter((p) => p.warranty_status === 'expiring_soon')
    .sort((a, b) => {
      const da = new Date(a.warranty_expiry_date || '').getTime()
      const db = new Date(b.warranty_expiry_date || '').getTime()
      return da - db
    })

  // Recent 5 products
  const recentProducts = products.slice(0, 5)

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--color-muted)',
        }}
      >
        <RefreshCw size={28} className="animate-spin" color="var(--color-accent)" />
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading your warranty pocket...</span>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div
        className="card-editorial"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '3rem auto',
          borderColor: 'var(--color-danger-border)',
        }}
      >
        <AlertCircle size={36} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
          Unable to Load Your Products
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {errorMsg}
        </p>
        <button onClick={loadData} className="btn-coral" style={{ margin: '0 auto' }}>
          <RefreshCw size={16} /> Retry Database Connection
        </button>
      </div>
    )
  }

  // ─── PART 2: GENUINE EMPTY STATE FOR NEW ACCOUNTS ───────────
  if (totalProducts === 0) {
    return (
      <div style={{ maxWidth: '820px', margin: '1.5rem auto' }}>
        <div
          className="card-editorial animate-slide-up"
          style={{
            padding: '4rem 2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '28px',
            boxShadow: '0 12px 40px rgba(56, 26, 22, 0.05)',
          }}
        >
          {/* Welcoming stamp */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-accent-soft)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
              marginBottom: '1.5rem',
            }}
          >
            <FolderOpen size={32} strokeWidth={2.2} />
          </div>

          <span className="pill-badge pill-coral" style={{ marginBottom: '1rem' }}>
            Fresh & Ready
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)',
              color: 'var(--color-text)',
              margin: '0 0 1rem',
              lineHeight: 1.2,
            }}
          >
            Your pocket is empty and ready for your first product.
          </h2>

          <p
            style={{
              color: 'var(--color-muted)',
              fontSize: '1.05rem',
              maxWidth: '560px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.6,
            }}
          >
            ProofPocket AI organizes your warranties, stores receipt photos, and counts down days before repair or return windows close.
            Every item you save stays permanently tied to your private account across all logins.
          </p>

          {/* Prominent Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-coral"
              style={{ fontSize: '0.98rem', padding: '0.8rem 1.8rem' }}
            >
              <Plus size={18} strokeWidth={2.4} /> Add Your First Product
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-editorial-ghost"
              style={{ fontSize: '0.98rem', padding: '0.8rem 1.6rem' }}
            >
              <Upload size={17} /> Upload a Receipt
            </button>
          </div>

          {/* Reassurance note */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--color-muted-light)',
              backgroundColor: 'var(--color-surface-soft)',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
            }}
          >
            <ShieldCheck size={14} color="var(--color-success)" />
            <span>Protected by Supabase Row-Level Security — only you can access your data.</span>
          </div>
        </div>

        {/* Modal for adding product */}
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(newProduct) => {
            setProducts([newProduct, ...products])
          }}
        />
      </div>
    )
  }

  // ─── ACTIVE DASHBOARD (WHEN PRODUCTS EXIST) ──────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Top Stat Cards ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Products */}
        <div className="card-editorial" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Total Products
            </span>
            <ShoppingBag size={18} color="var(--color-accent)" />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-text)', lineHeight: 1 }}>
            {totalProducts}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.35rem', display: 'block' }}>
            {formatCurrency(totalSpending)} tracked value
          </span>
        </div>

        {/* Active Warranties */}
        <div className="card-editorial" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Active Warranties
            </span>
            <ShieldCheck size={18} color="var(--color-success)" />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-success)', lineHeight: 1 }}>
            {activeWarranties}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.35rem', display: 'block' }}>
            Covered by manufacturer
          </span>
        </div>

        {/* Expiring Soon */}
        <div
          className="card-editorial"
          style={{
            padding: '1.5rem',
            backgroundColor: expiringSoon > 0 ? 'var(--color-warning-bg)' : 'var(--color-surface)',
            borderColor: expiringSoon > 0 ? 'var(--color-warning-border)' : 'var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: expiringSoon > 0 ? 'var(--color-warning)' : 'var(--color-muted)', textTransform: 'uppercase' }}>
              Expiring Soon
            </span>
            <Clock size={18} color={expiringSoon > 0 ? 'var(--color-warning)' : 'var(--color-muted)'} />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.2rem',
              color: expiringSoon > 0 ? 'var(--color-warning)' : 'var(--color-text)',
              lineHeight: 1,
            }}
          >
            {expiringSoon}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.35rem', display: 'block' }}>
            Within the next 30 days
          </span>
        </div>

        {/* Expired / Missing */}
        <div className="card-editorial" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Expired / Unknown
            </span>
            <AlertTriangle size={18} color="var(--color-danger)" />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-danger)', lineHeight: 1 }}>
            {expiredWarranties} <span style={{ fontSize: '1rem', color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>/ {missingWarranty} unk</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.35rem', display: 'block' }}>
            Out of warranty coverage
          </span>
        </div>
      </div>

      {/* ── Expiring Soon Alert Banner (if any) ────────────────── */}
      {expiringSoon > 0 && (
        <div
          className="card-editorial animate-slide-up"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFDF5',
            border: '1.5px solid var(--color-warning-border)',
            borderRadius: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="pill-badge pill-expiring">Urgent Attention</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0, color: 'var(--color-text)' }}>
              {expiringSoon} {expiringSoon === 1 ? 'warranty is' : 'warranties are'} expiring within 30 days
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expiringItems.map((item) => {
              const days = getDaysRemaining(item.warranty_expiry_date)
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-text)', display: 'block' }}>
                      {item.product_name} {item.brand ? `(${item.brand})` : ''}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                      Expires on {item.warranty_expiry_date} • {item.service_contact ? `Service: ${item.service_contact}` : 'No contact saved'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="pill-badge pill-expiring">
                      {days !== null && days >= 0 ? `${days} days left` : 'Expired'}
                    </span>
                    <button
                      onClick={() => setEditingProduct(item)}
                      className="btn-editorial-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    >
                      <Edit2 size={13} /> Edit Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Recent Saved Products ─────────────────────────────── */}
      <div className="card-editorial" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: 'var(--color-text)', margin: 0 }}>
              Recent Products in Your Wallet
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Showing {recentProducts.length} of {totalProducts} saved items
            </p>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="btn-coral">
            <Plus size={16} strokeWidth={2.4} /> Add Product
          </button>
        </div>

        {/* Product Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', color: 'var(--color-muted)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Product</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Purchased</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Warranty Expiry</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => {
                const days = getDaysRemaining(p.warranty_expiry_date)
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Product Name & Brand */}
                    <td style={{ padding: '1rem', color: 'var(--color-text)', fontWeight: 700 }}>
                      <div>{p.product_name}</div>
                      {p.brand && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                          {p.brand} {p.model ? `• ${p.model}` : ''}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem', color: 'var(--color-muted)' }}>
                      <span className="pill-badge pill-unknown" style={{ fontSize: '0.7rem' }}>
                        {p.category}
                      </span>
                    </td>

                    {/* Purchased Date & Amount */}
                    <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                      <div>{p.purchase_date || '—'}</div>
                      {p.amount !== null && p.amount !== undefined && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                          {formatCurrency(p.amount, p.currency)}
                        </div>
                      )}
                    </td>

                    {/* Expiry Date */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                        {p.warranty_expiry_date || <span style={{ color: 'var(--color-muted)' }}>Unknown</span>}
                      </div>
                      {days !== null && (
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: days < 0 ? 'var(--color-danger)' : days <= 30 ? 'var(--color-warning)' : 'var(--color-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {days < 0 ? `${Math.abs(days)}d ago` : `${days}d remaining`}
                        </div>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: '1rem' }}>
                      {p.warranty_status === 'active' && <span className="pill-badge pill-active">Active</span>}
                      {p.warranty_status === 'expiring_soon' && <span className="pill-badge pill-expiring">Expiring</span>}
                      {p.warranty_status === 'expired' && <span className="pill-badge pill-expired">Expired</span>}
                      {p.warranty_status === 'unknown' && <span className="pill-badge pill-unknown">Unknown</span>}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="btn-editorial-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newP) => {
          setProducts([newP, ...products])
        }}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onUpdated={(updated) => {
          setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
        }}
        onDeleted={(deletedId) => {
          setProducts(products.filter((p) => p.id !== deletedId))
        }}
      />
    </div>
  )
}
