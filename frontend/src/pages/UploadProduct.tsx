import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Tag,
  FileText,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  createProduct,
  uploadProductDocument,
  calculateWarrantyExpiry,
  type CreateProductInput,
} from '../lib/database'

export default function UploadProduct() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form State
  const [productName, setProductName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [serialNumber, setSerialNumber] = useState('')
  const [seller, setSeller] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Warranty State
  const [warrantyProvider, setWarrantyProvider] = useState('')
  const [warrantyStartDate, setWarrantyStartDate] = useState('')
  const [warrantyDuration, setWarrantyDuration] = useState('')
  const [durationUnit, setDurationUnit] = useState<'months' | 'years'>('months')
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('')
  const [returnDeadline, setReturnDeadline] = useState('')
  const [extendedWarranty, setExtendedWarranty] = useState('')
  const [coverageDetails, setCoverageDetails] = useState('')
  const [serviceContact, setServiceContact] = useState('')

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<'receipt' | 'invoice' | 'warranty_card' | 'manual'>('receipt')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScanningAI, setIsScanningAI] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [aiNotice, setAiNotice] = useState<string | null>(null)

  // Auto-calculate expiry date
  const handleDurationOrStartChange = (
    newStart?: string,
    newDuration?: string,
    newUnit?: 'months' | 'years'
  ) => {
    const sDate = newStart !== undefined ? newStart : warrantyStartDate
    const durStr = newDuration !== undefined ? newDuration : warrantyDuration
    const unit = newUnit !== undefined ? newUnit : durationUnit

    const durNum = parseInt(durStr, 10)
    if (sDate && !isNaN(durNum) && durNum > 0) {
      const calculated = calculateWarrantyExpiry(sDate, durNum, unit)
      if (calculated) {
        setWarrantyExpiryDate(calculated)
      }
    }
  }

  // Handle AI Scan
  const handleAiScan = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a receipt or invoice file first to run AI extraction.')
      return
    }

    setIsScanningAI(true)
    setErrorMsg(null)
    setAiNotice(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/v1/extract', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.product_name) setProductName(data.product_name)
        if (data.brand) setBrand(data.brand)
        if (data.model) setModel(data.model)
        if (data.seller) setSeller(data.seller)
        if (data.purchase_date) setPurchaseDate(data.purchase_date)
        if (data.amount) setPurchasePrice(data.amount.toString())
        if (data.currency) setCurrency(data.currency)
        if (data.invoice_number) setOrderNumber(data.invoice_number)
        if (data.warranty_duration_months) {
          setWarrantyDuration(data.warranty_duration_months.toString())
          setDurationUnit('months')
          if (data.purchase_date) {
            setWarrantyStartDate(data.purchase_date)
            const exp = calculateWarrantyExpiry(data.purchase_date, data.warranty_duration_months, 'months')
            if (exp) setWarrantyExpiryDate(exp)
          }
        }
        setAiNotice('Document scanned! Extracted fields have been pre-filled. Please review for accuracy before saving.')
      } else {
        setAiNotice('Receipt scanned locally. Please verify your product & warranty details below.')
      }
    } catch (err: any) {
      console.warn('AI scan error:', err)
      setAiNotice('Receipt ready for upload. Please fill in the details below.')
    } finally {
      setIsScanningAI(false)
    }
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setErrorMsg('You must be logged in to save a product.')
      return
    }

    if (!productName.trim()) {
      setErrorMsg('Product Name is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      let durationMonths: number | undefined
      if (warrantyDuration) {
        const num = parseInt(warrantyDuration, 10)
        if (!isNaN(num) && num > 0) {
          durationMonths = durationUnit === 'years' ? num * 12 : num
        }
      }

      const productPayload: CreateProductInput = {
        product_name: productName.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        category: category || undefined,
        serial_number: serialNumber.trim() || undefined,
        seller: seller.trim() || undefined,
        amount: purchasePrice ? parseFloat(purchasePrice) : undefined,
        currency: currency || 'INR',
        purchase_date: purchaseDate || undefined,
        invoice_number: orderNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        warranty_provider: warrantyProvider.trim() || undefined,
        warranty_start_date: warrantyStartDate || undefined,
        warranty_duration: durationMonths,
        warranty_duration_months: durationMonths,
        warranty_expiry_date: warrantyExpiryDate || undefined,
        return_deadline: returnDeadline || undefined,
        extended_warranty: extendedWarranty.trim() || undefined,
        coverage_details: coverageDetails.trim() || undefined,
        service_contact: serviceContact.trim() || undefined,
        warranty_verified_status: 'user_entered',
      }

      // 1. Create product in Supabase
      const newProduct = await createProduct(user.id, productPayload)

      // 2. Upload document if attached
      if (selectedFile) {
        try {
          await uploadProductDocument(user.id, newProduct.id, selectedFile, documentType)
        } catch (uploadErr) {
          console.warn('[Upload] Document upload warning:', uploadErr)
        }
      }

      // Dispatch global refresh event
      window.dispatchEvent(new CustomEvent('proofpocket:product-added'))

      // Navigate to Purchases
      navigate('/app/purchases')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product to Supabase.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-editorial-ghost"
          style={{ padding: '0.5rem 0.75rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
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
            Product Registry
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              fontWeight: 900,
              lineHeight: 1.15,
              color: 'var(--color-text)',
              margin: '0.2rem 0 0',
            }}
          >
            Add New Product & Warranty
          </h1>
        </div>
      </div>

      {/* ── AI Receipt Scanner Card ────────────────────────────── */}
      <div
        className="card-editorial"
        style={{
          padding: '1.75rem',
          backgroundColor: '#FFFEFA',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--color-accent)" />
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--color-text)',
                }}
              >
                Scan Receipt or Document (Optional)
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.2rem 0 0' }}>
              Attach a receipt or warranty certificate. ProofPocket AI can read product names, amounts, and dates automatically.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0])
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-editorial-ghost"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <Upload size={14} />
              <span>{selectedFile ? 'Change File' : 'Choose Receipt'}</span>
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={handleAiScan}
                disabled={isScanningAI}
                className="btn-coral"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              >
                <Sparkles size={14} className={isScanningAI ? 'animate-spin' : ''} />
                <span>{isScanningAI ? 'Scanning…' : 'Scan with AI'}</span>
              </button>
            )}
          </div>
        </div>

        {selectedFile && (
          <div
            style={{
              padding: '0.65rem 0.9rem',
              backgroundColor: 'var(--color-bg)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--color-accent)" />
              <strong style={{ color: 'var(--color-text)' }}>{selectedFile.name}</strong>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              style={{
                fontSize: '0.78rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="receipt">Receipt</option>
              <option value="invoice">Invoice</option>
              <option value="warranty_card">Warranty Card</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        )}

        {aiNotice && (
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
            }}
          >
            <CheckCircle size={16} />
            <span>{aiNotice}</span>
          </div>
        )}
      </div>

      {/* ── Form Error ─────────────────────────────────────────── */}
      {errorMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Main Product & Warranty Form ───────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section A: Product Details */}
        <div className="card-editorial" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Tag size={18} color="var(--color-accent)" />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              A. Product Details
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Product Name (Required) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Product Name <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro 16-inch M3 Max"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Brand */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Apple"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Model */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Model Number / Name
              </label>
              <input
                type="text"
                placeholder="e.g. A2991"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                <option value="Electronics">Electronics</option>
                <option value="Appliances">Home Appliances</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Gadgets">Gadgets & Audio</option>
                <option value="Vehicles">Vehicles & Automotive</option>
                <option value="Tools & Hardware">Tools & Hardware</option>
                <option value="Fashion">Fashion & Watches</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Serial Number */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Serial Number or IMEI
              </label>
              <input
                type="text"
                placeholder="e.g. C02GL3XPMD6R"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Seller / Store */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Seller or Retail Store
              </label>
              <input
                type="text"
                placeholder="e.g. Apple BKC Store / Amazon"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Purchase Price & Currency */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Purchase Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 249900"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => {
                  setPurchaseDate(e.target.value)
                  // If warranty start date is empty, default it
                  if (!warrantyStartDate) {
                    setWarrantyStartDate(e.target.value)
                    handleDurationOrStartChange(e.target.value)
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Order or Invoice Number */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Order / Invoice Number
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-9812"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section B: Warranty & Coverage Details */}
        <div className="card-editorial" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={18} color="var(--color-accent)" />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              B. Warranty & Coverage Terms
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Warranty Provider */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Warranty Provider
              </label>
              <input
                type="text"
                placeholder="e.g. AppleCare / OEM Manufacturer"
                value={warrantyProvider}
                onChange={(e) => setWarrantyProvider(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Warranty Start Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Warranty Start Date
              </label>
              <input
                type="date"
                value={warrantyStartDate}
                onChange={(e) => {
                  setWarrantyStartDate(e.target.value)
                  handleDurationOrStartChange(e.target.value)
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Warranty Duration & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Duration
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 12 or 2"
                  value={warrantyDuration}
                  onChange={(e) => {
                    setWarrantyDuration(e.target.value)
                    handleDurationOrStartChange(undefined, e.target.value)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Unit
                </label>
                <select
                  value={durationUnit}
                  onChange={(e) => {
                    const u = e.target.value as 'months' | 'years'
                    setDurationUnit(u)
                    handleDurationOrStartChange(undefined, undefined, u)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            {/* Warranty Expiry Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Warranty Expiry Date
              </label>
              <input
                type="date"
                value={warrantyExpiryDate}
                onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Return Deadline */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Return / Replacement Deadline
              </label>
              <input
                type="date"
                value={returnDeadline}
                onChange={(e) => setReturnDeadline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Service Contact */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Support Contact / Service Center
              </label>
              <input
                type="text"
                placeholder="e.g. 1800-800-2753 / support@apple.com"
                value={serviceContact}
                onChange={(e) => setServiceContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Extended Warranty */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Extended Warranty Details
              </label>
              <input
                type="text"
                placeholder="e.g. AppleCare+ 2-Year Plan / Retailer Accidental Plan"
                value={extendedWarranty}
                onChange={(e) => setExtendedWarranty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* General Notes */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                General Notes / Storage Location
              </label>
              <input
                type="text"
                placeholder="e.g. Physical box kept in attic, registered with OEM online"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Coverage Notes */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}
              >
                Coverage Notes & Exclusions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Covers manufacturing defects, battery health degradation below 80%. Excludes water damage."
                value={coverageDetails}
                onChange={(e) => setCoverageDetails(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Submit Action ───────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingBottom: '3rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-editorial-ghost"
            style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-coral"
            style={{ padding: '0.85rem 2.25rem', fontSize: '0.95rem' }}
          >
            <span>{isSubmitting ? 'Saving to Supabase…' : 'Save Product & Warranty'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
