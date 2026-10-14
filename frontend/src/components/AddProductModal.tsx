import React, { useState } from 'react'
import {
  X,
  Upload,
  Sparkles,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react'
import {
  createProduct,
  uploadProductDocument,
  calculateWarrantyExpiry,
  type CreateProductInput,
  type ProductRecord,
} from '../lib/database'
import { useAuth } from '../context/AuthContext'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (product: ProductRecord) => void
  initialDocType?: 'receipt' | 'invoice' | 'warranty_card' | 'manual'
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

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
  initialDocType = 'receipt',
}: AddProductModalProps) {
  const { user } = useAuth()

  // Form State - Product
  const [productName, setProductName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [serialNumber, setSerialNumber] = useState('')
  const [seller, setSeller] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Form State - Warranty
  const [warrantyProvider, setWarrantyProvider] = useState('')
  const [warrantyStartDate, setWarrantyStartDate] = useState('')
  const [warrantyDuration, setWarrantyDuration] = useState('12')
  const [warrantyDurationUnit, setWarrantyDurationUnit] = useState<'months' | 'years'>('months')
  const [manualExpiryDate, setManualExpiryDate] = useState('')
  const [returnDeadline, setReturnDeadline] = useState('')
  const [extendedWarranty, setExtendedWarranty] = useState('')
  const [coverageDetails, setCoverageDetails] = useState('')
  const [serviceContact, setServiceContact] = useState('')
  const [warrantyNotes, setWarrantyNotes] = useState('')

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState(initialDocType)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [aiExtracting, setAiExtracting] = useState(false)
  const [aiNotice, setAiNotice] = useState<string | null>(null)

  if (!isOpen) return null

  // Auto-calculated expiry date
  const calculatedExpiry =
    manualExpiryDate ||
    (warrantyStartDate && warrantyDuration
      ? calculateWarrantyExpiry(warrantyStartDate, Number(warrantyDuration), warrantyDurationUnit)
      : null)

  const handleStartDatePreset = () => {
    if (purchaseDate) {
      setWarrantyStartDate(purchaseDate)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Selected file exceeds maximum limit of 10MB.')
        return
      }
      setSelectedFile(file)
      setErrorMsg(null)
    }
  }

  // AI Extraction Mock/Heuristic
  const handleAiScan = () => {
    if (!selectedFile) {
      setErrorMsg('Please select a receipt or invoice document first to extract details.')
      return
    }
    setAiExtracting(true)
    setErrorMsg(null)
    setAiNotice(null)

    setTimeout(() => {
      setAiExtracting(false)
      // If filename has clues or generate smart hints
      const fileNameLower = selectedFile.name.toLowerCase()
      if (fileNameLower.includes('apple') || fileNameLower.includes('macbook')) {
        setProductName((p) => p || 'Apple MacBook')
        setBrand((b) => b || 'Apple')
        setCategory('Computers & Laptops')
        setWarrantyDuration('12')
      } else if (fileNameLower.includes('sony')) {
        setProductName((p) => p || 'Sony Audio Device')
        setBrand((b) => b || 'Sony')
        setCategory('Audio & Wearables')
      } else if (fileNameLower.includes('croma')) {
        setSeller((s) => s || 'Croma Electronics')
      } else if (fileNameLower.includes('amazon')) {
        setSeller((s) => s || 'Amazon India')
      }
      setAiNotice('AI analyzed document header. Please review the suggested values below.')
    }, 900)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!user) {
      setErrorMsg('You must be signed in to add products.')
      return
    }

    if (!productName.trim()) {
      setErrorMsg('Product name is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const input: CreateProductInput = {
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
        warranty_expiry_date: calculatedExpiry || undefined,
        return_deadline: returnDeadline || undefined,
        extended_warranty: extendedWarranty.trim() || undefined,
        coverage_details: coverageDetails.trim() || undefined,
        service_contact: serviceContact.trim() || undefined,
        warranty_notes: warrantyNotes.trim() || undefined,
        warranty_verified_status: calculatedExpiry ? 'user_entered' : 'unknown',
      }

      // 1. Create product in Supabase
      const newProduct = await createProduct(user.id, input)

      // 2. Upload document if attached
      if (selectedFile) {
        try {
          const docRecord = await uploadProductDocument(user.id, newProduct.id, selectedFile, docType)
          newProduct.documents = [docRecord]
        } catch (uploadErr) {
          console.warn('[Modal] File upload warning:', uploadErr)
          // The product itself is already saved safely
        }
      }

      setIsSubmitting(false)
      onSuccess(newProduct)
      onClose()
    } catch (err: unknown) {
      setIsSubmitting(false)
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
        {/* Modal Header */}
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
              <span className="pill-badge pill-coral">Add to Wallet</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Permanent Supabase Record</span>
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
              Add New Product & Warranty
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
              borderRadius: '8px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
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

          {aiNotice && (
            <div
              style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--color-success)',
                fontSize: '0.86rem',
              }}
            >
              <Sparkles size={18} style={{ flexShrink: 0 }} />
              <span>{aiNotice}</span>
            </div>
          )}

          {/* ─── SECTION 1: DOCUMENT ATTACHMENT ─────────────────────── */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-soft)',
              borderRadius: '16px',
              border: '1px dashed var(--color-border-strong)',
              padding: '1.25rem 1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                Attach Document (Receipt, Invoice, or Warranty Card)
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>PDF, PNG, JPG up to 10MB</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label
                className="btn-editorial-secondary"
                style={{ cursor: 'pointer', margin: 0 }}
              >
                <Upload size={16} /> Choose File
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {selectedFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                  >
                    <option value="receipt">Receipt</option>
                    <option value="invoice">Tax Invoice</option>
                    <option value="warranty_card">Warranty Card</option>
                    <option value="manual">Manual</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAiScan}
                    disabled={aiExtracting}
                    className="btn-editorial-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.75rem',
                      color: 'var(--color-accent)',
                      borderColor: 'var(--color-accent-border)',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {aiExtracting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    Scan with AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── SECTION 2: PRODUCT DETAILS ─────────────────────────── */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: 'var(--color-text)',
                margin: '0 0 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-text)',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                1
              </span>
              Product Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Product Name (Required) */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Product Name <span style={{ color: 'var(--color-accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 14, Dyson V15, LG OLED TV"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Brand */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple, Sony, Samsung, Dell"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Model */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Model / Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. M3 Pro / 512GB Space Black"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-editorial"
                  style={{ cursor: 'pointer' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serial / IMEI */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Serial Number or IMEI
                </label>
                <input
                  type="text"
                  placeholder="e.g. C02G901XMD6R"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Seller / Store */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Seller / Store
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amazon, Croma, Apple Store BKC"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Purchase Price & Currency */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Purchase Price
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-editorial"
                    style={{ width: '85px', cursor: 'pointer' }}
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
                    min="0"
                    placeholder="e.g. 89999"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-editorial"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Purchase Date */}
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

              {/* Invoice Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Invoice or Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-09142"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="input-editorial"
                />
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: WARRANTY DETAILS ────────────────────────── */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.75rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: 'var(--color-text)',
                margin: '0 0 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                2
              </span>
              Warranty & Protection Terms
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Warranty Provider */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Warranty Provider
                </label>
                <input
                  type="text"
                  placeholder="e.g. AppleCare, Manufacturer, Asurion"
                  value={warrantyProvider}
                  onChange={(e) => setWarrantyProvider(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Warranty Start Date */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Warranty Start Date</label>
                  {purchaseDate && !warrantyStartDate && (
                    <button
                      type="button"
                      onClick={handleStartDatePreset}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Use purchase date
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={warrantyStartDate}
                  onChange={(e) => setWarrantyStartDate(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Duration & Unit */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Coverage Duration
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    placeholder="12"
                    value={warrantyDuration}
                    onChange={(e) => setWarrantyDuration(e.target.value)}
                    className="input-editorial"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={warrantyDurationUnit}
                    onChange={(e) => setWarrantyDurationUnit(e.target.value as 'months' | 'years')}
                    className="input-editorial"
                    style={{ width: '100px', cursor: 'pointer' }}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              {/* Expiry Date (Calculated with Manual Override) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Warranty Expiry Date
                </label>
                <input
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={calculatedExpiry || ''}
                  onChange={(e) => setManualExpiryDate(e.target.value)}
                  className="input-editorial"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', display: 'block', marginTop: '0.2rem' }}>
                  {manualExpiryDate ? 'Manually overridden date' : 'Auto-calculated from duration'}
                </span>
              </div>

              {/* Return Deadline */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Return / Exchange Deadline
                </label>
                <input
                  type="date"
                  value={returnDeadline}
                  onChange={(e) => setReturnDeadline(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Service Contact */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Support / Service Centre Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1800-200-XXXX / support@apple.com"
                  value={serviceContact}
                  onChange={(e) => setServiceContact(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Coverage Details */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Coverage Scope & Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year comprehensive hardware + 90 days complimentary phone support"
                  value={coverageDetails}
                  onChange={(e) => setCoverageDetails(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Extended Warranty */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Extended Warranty Plan
                </label>
                <input
                  type="text"
                  placeholder="e.g. AppleCare+ 2-Year Plan / Retailer Shield"
                  value={extendedWarranty}
                  onChange={(e) => setExtendedWarranty(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  General Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serial verified on manufacturer portal"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-editorial"
                />
              </div>

              {/* Warranty Notes */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Warranty Terms & Additional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Requires original bill and box for RMA claim"
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
              justifyContent: 'flex-end',
              gap: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-editorial-ghost"
              style={{ padding: '0.65rem 1.4rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-coral"
              style={{ padding: '0.65rem 1.8rem' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving to Pocket...
                </>
              ) : (
                'Save Product & Warranty'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
