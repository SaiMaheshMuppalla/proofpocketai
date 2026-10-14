import React, { useState } from 'react'
import {
  X,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import {
  updateProduct,
  deleteProduct,
  calculateWarrantyExpiry,
  type ProductRecord,
  type CreateProductInput,
} from '../lib/database'

interface EditProductModalProps {
  product: ProductRecord | null
  isOpen: boolean
  onClose: () => void
  onUpdated?: (updated: ProductRecord) => void
  onDeleted?: (productId: string) => void
  onSuccess?: () => void
}

const CATEGORIES = [
  'Electronics',
  'Appliances',
  'Home & Kitchen',
  'Gadgets',
  'Vehicles',
  'Computers & Laptops',
  'Smartphones',
  'Audio & Wearables',
  'Furniture',
  'Tools & Hardware',
  'Healthcare',
  'Other',
]

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
  onSuccess,
}: EditProductModalProps) {
  if (!isOpen || !product) return null

  const [productName, setProductName] = useState(product.product_name || '')
  const [brand, setBrand] = useState(product.brand || '')
  const [model, setModel] = useState(product.model || '')
  const [category, setCategory] = useState(product.category || 'Electronics')
  const [serialNumber, setSerialNumber] = useState(product.serial_number || '')
  const [seller, setSeller] = useState(product.seller || '')
  const [amount, setAmount] = useState(product.amount?.toString() || '')
  const [currency, setCurrency] = useState(product.currency || 'INR')
  const [purchaseDate, setPurchaseDate] = useState(product.purchase_date || '')
  const [invoiceNumber, setInvoiceNumber] = useState(product.invoice_number || '')
  const [notes, setNotes] = useState(product.notes || '')

  const [warrantyProvider, setWarrantyProvider] = useState(product.warranty_provider || '')
  const [warrantyStartDate, setWarrantyStartDate] = useState(product.warranty_start_date || '')
  const [warrantyDuration, setWarrantyDuration] = useState(product.warranty_duration?.toString() || '12')
  const [warrantyDurationUnit, setWarrantyDurationUnit] = useState<'months' | 'years'>(
    product.warranty_duration_unit || 'months'
  )
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState(product.warranty_expiry_date || '')
  const [returnDeadline, setReturnDeadline] = useState(product.return_deadline || '')
  const [extendedWarranty, setExtendedWarranty] = useState(product.extended_warranty || '')
  const [coverageDetails, setCoverageDetails] = useState(product.coverage_details || '')
  const [serviceContact, setServiceContact] = useState(product.service_contact || '')
  const [warrantyNotes, setWarrantyNotes] = useState(product.warranty_notes || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleRecalculateExpiry = () => {
    if (warrantyStartDate && warrantyDuration) {
      const calculated = calculateWarrantyExpiry(
        warrantyStartDate,
        Number(warrantyDuration),
        warrantyDurationUnit
      )
      if (calculated) {
        setWarrantyExpiryDate(calculated)
      }
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!productName.trim()) {
      setErrorMsg('Product name cannot be empty.')
      return
    }

    setIsSubmitting(true)

    try {
      const input: Partial<CreateProductInput> = {
        product_name: productName.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        category: category || 'Electronics',
        serial_number: serialNumber.trim() || undefined,
        seller: seller.trim() || undefined,
        amount: amount ? Number(amount) : undefined,
        currency: currency || 'INR',
        purchase_date: purchaseDate || undefined,
        invoice_number: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        warranty_provider: warrantyProvider.trim() || undefined,
        warranty_start_date: warrantyStartDate || undefined,
        warranty_duration: warrantyDuration ? Number(warrantyDuration) : undefined,
        warranty_duration_unit: warrantyDurationUnit,
        warranty_expiry_date: warrantyExpiryDate || undefined,
        return_deadline: returnDeadline || undefined,
        extended_warranty: extendedWarranty.trim() || undefined,
        coverage_details: coverageDetails.trim() || undefined,
        service_contact: serviceContact.trim() || undefined,
        warranty_notes: warrantyNotes.trim() || undefined,
      }

      const updated = await updateProduct(product.id, input)
      setIsSubmitting(false)
      if (onUpdated) onUpdated({ ...product, ...updated })
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: unknown) {
      setIsSubmitting(false)
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.product_name}" and its warranty records?`)) {
      return
    }

    setIsDeleting(true)
    setErrorMsg(null)

    try {
      await deleteProduct(product.id)
      setIsDeleting(false)
      if (onDeleted) onDeleted(product.id)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: unknown) {
      setIsDeleting(false)
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(56, 26, 22, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card-editorial animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(56, 26, 22, 0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-soft)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span className="pill-badge pill-unknown">Edit Mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>ID: {product.id.slice(0, 8)}...</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.65rem',
                margin: 0,
                color: 'var(--color-text)',
                lineHeight: 1.2,
              }}
            >
              Edit Product & Warranty Details
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: '0.4rem',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleUpdate}
          style={{
            padding: '2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
          }}
        >
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--color-danger)',
                fontSize: '0.86rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Product info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Product Name <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="input-editorial"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input-editorial"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Model
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input-editorial"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-editorial"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Serial Number or IMEI
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="input-editorial"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Seller / Store
              </label>
              <input
                type="text"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                className="input-editorial"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Purchase Price
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-editorial"
                  style={{ width: '85px' }}
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-editorial"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="input-editorial"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Invoice / Order Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="input-editorial"
              />
            </div>
          </div>

          {/* Section 2: Warranty details */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--color-text)',
                margin: '0 0 1rem',
              }}
            >
              Warranty Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Warranty Provider
                </label>
                <input
                  type="text"
                  value={warrantyProvider}
                  onChange={(e) => setWarrantyProvider(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Warranty Start Date
                </label>
                <input
                  type="date"
                  value={warrantyStartDate}
                  onChange={(e) => setWarrantyStartDate(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Coverage Duration
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    value={warrantyDuration}
                    onChange={(e) => setWarrantyDuration(e.target.value)}
                    className="input-editorial"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={warrantyDurationUnit}
                    onChange={(e) => setWarrantyDurationUnit(e.target.value as 'months' | 'years')}
                    className="input-editorial"
                    style={{ width: '100px' }}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Warranty Expiry Date</label>
                  {warrantyStartDate && warrantyDuration && (
                    <button
                      type="button"
                      onClick={handleRecalculateExpiry}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Recalculate
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={warrantyExpiryDate}
                  onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Return Deadline
                </label>
                <input
                  type="date"
                  value={returnDeadline}
                  onChange={(e) => setReturnDeadline(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Service Centre Contact
                </label>
                <input
                  type="text"
                  value={serviceContact}
                  onChange={(e) => setServiceContact(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Coverage Scope & Terms
                </label>
                <input
                  type="text"
                  value={coverageDetails}
                  onChange={(e) => setCoverageDetails(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Extended Warranty
                </label>
                <input
                  type="text"
                  value={extendedWarranty}
                  onChange={(e) => setExtendedWarranty(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  General Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-editorial"
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Warranty Notes
                </label>
                <input
                  type="text"
                  value={warrantyNotes}
                  onChange={(e) => setWarrantyNotes(e.target.value)}
                  className="input-editorial"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="btn-editorial-secondary"
              style={{
                color: 'var(--color-danger)',
                borderColor: 'var(--color-danger-border)',
                backgroundColor: 'var(--color-danger-bg)',
              }}
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete Product
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-editorial-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-coral"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
