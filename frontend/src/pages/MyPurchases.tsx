import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  RefreshCw,
  ShoppingBag,
  Edit3,
  Calendar,
  AlertCircle,
  Tag,
  Building,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchUserProducts,
  type ProductRecord,
  formatCurrency,
  formatDisplayDate,
  calculateWarrantyStatus,
} from '../lib/database'
import EditProductModal from '../components/EditProductModal'
import AddProductModal from '../components/AddProductModal'

const CATEGORIES = [
  'All',
  'Electronics',
  'Appliances',
  'Home & Living',
  'Gadgets',
  'Vehicles',
  'Tools & Hardware',
  'Fashion',
  'Other',
] as const

export default function MyPurchases() {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'>('date_desc')

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
      setError(err?.message || 'Failed to fetch purchases')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Listen for global product changes
  useEffect(() => {
    const handleRefresh = () => loadData()
    window.addEventListener('proofpocket:product-added', handleRefresh)
    window.addEventListener('proofpocket:product-updated', handleRefresh)
    return () => {
      window.removeEventListener('proofpocket:product-added', handleRefresh)
      window.removeEventListener('proofpocket:product-updated', handleRefresh)
    }
  }, [loadData])

  // Filtered & sorted products
  const filtered = products
    .filter((p) => {
      const matchCat =
        selectedCategory === 'All' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        p.product_name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.model && p.model.toLowerCase().includes(q)) ||
        (p.seller && p.seller.toLowerCase().includes(q)) ||
        (p.invoice_number && p.invoice_number.toLowerCase().includes(q))

      return matchCat && matchSearch
    })
    .sort((a, b) => {
      const dateA = new Date(a.purchase_date || a.created_at || '').getTime() || 0
      const dateB = new Date(b.purchase_date || b.created_at || '').getTime() || 0

      if (sortBy === 'date_desc') {
        return dateB - dateA
      }
      if (sortBy === 'date_asc') {
        return dateA - dateB
      }
      if (sortBy === 'price_desc') {
        return (b.amount || 0) - (a.amount || 0)
      }
      if (sortBy === 'price_asc') {
        return (a.amount || 0) - (b.amount || 0)
      }
      return 0
    })

  const totalValue = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0)

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
            Vault Ledger
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
            My Purchases
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--color-muted)',
              margin: 0,
            }}
          >
            {isLoading
              ? 'Loading your collection…'
              : `${filtered.length} of ${products.length} registered products · Total value: ${formatCurrency(
                  totalValue,
                  'INR'
                )}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => loadData()}
            className="btn-editorial-ghost"
            style={{ padding: '0.65rem 1rem' }}
            title="Refresh database records"
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
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────── */}
      <div
        className="card-editorial"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              id="purchases-search"
              placeholder="Search product, brand, model, merchant, or invoice…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 2.5rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'var(--color-text)',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="date_desc">Purchase Date (Newest)</option>
              <option value="date_asc">Purchase Date (Oldest)</option>
              <option value="price_desc">Price (Highest First)</option>
              <option value="price_asc">Price (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700, marginRight: '0.25rem' }}>
            Categories:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="btn-editorial-ghost"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: '#FCA5A5', color: '#991B1B' }}
          >
            Retry
          </button>
        </div>
      )}

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
            Retrieving Your Purchases
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', margin: 0 }}>
            Querying Supabase database with authenticated Row Level Security…
          </p>
        </div>
      )}

      {/* ── Genuine Zero State (Account has no products) ────────── */}
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
            <ShoppingBag size={28} color="var(--color-accent)" />
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
            Your vault is completely empty.
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
            You haven't logged any purchases yet. Add your smartphones, laptops, home appliances, or accessories along with
            receipts to begin tracking your warranty protection.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-coral"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            <Plus size={18} />
            <span>Add Your First Purchase</span>
          </button>
        </div>
      )}

      {/* ── Filter/Search Miss (Products exist, but filter has 0 matches) ── */}
      {!isLoading && products.length > 0 && filtered.length === 0 && (
        <div
          className="card-editorial"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <Search size={32} color="var(--color-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
            }}
          >
            No purchases match your criteria
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Try resetting your search query or switching to “All” categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="btn-editorial-ghost"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Products List / Table ───────────────────────────────── */}
      {!isLoading && filtered.length > 0 && (
        <div
          className="card-editorial"
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr auto',
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-muted)',
              alignItems: 'center',
            }}
          >
            <span>Product & Merchant</span>
            <span>Category</span>
            <span>Purchase Date</span>
            <span>Price</span>
            <span>Warranty</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {/* Table Rows */}
          {filtered.map((item, index) => {
            const status = calculateWarrantyStatus(item.warranty_expiry_date)
            const isLast = index === filtered.length - 1

            return (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr auto',
                  padding: '1.25rem 1.5rem',
                  alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                  transition: 'background-color 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(247, 243, 233, 0.45)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => setSelectedProduct(item)}
              >
                {/* Product & Merchant */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingBag size={20} color="var(--color-accent)" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 700,
                        fontSize: '0.96rem',
                        color: 'var(--color-text)',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.product_name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.2rem',
                      }}
                    >
                      {item.brand && <span>{item.brand}</span>}
                      {item.model && <span>• {item.model}</span>}
                      {item.seller && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building size={12} /> {item.seller}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Tag size={10} color="var(--color-accent)" />
                    {item.category || 'General'}
                  </span>
                </div>

                {/* Purchase Date */}
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} />
                  <span>{formatDisplayDate(item.purchase_date)}</span>
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {formatCurrency(item.amount, item.currency || 'INR')}
                </div>

                {/* Warranty Pill */}
                <div>
                  {status === 'active' && <span className="pill-active">Active</span>}
                  {status === 'expiring_soon' && <span className="pill-expiring">Expiring Soon</span>}
                  {status === 'expired' && <span className="pill-expired">Expired</span>}
                  {status === 'unknown' && <span className="pill-unknown">Unspecified</span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(item)
                    }}
                    className="btn-editorial-ghost"
                    style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                    }}
                    title="View & Edit details"
                  >
                    <Edit3 size={13} />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Edit / View Product Modal ───────────────────────────── */}
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
