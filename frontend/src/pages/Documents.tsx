import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FileText,
  Image as ImageIcon,
  Search,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle,
  Lock,
  Plus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchUserDocuments,
  uploadStandaloneDocument,
  deleteDocument,
  type DocumentRecord,
  formatDisplayDate,
} from '../lib/database'

type DocTypeFilter = 'all' | 'receipt' | 'invoice' | 'warranty_card' | 'manual' | 'other'

export default function Documents() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocTypeFilter>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Uploading state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null)
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null)
  const [selectedUploadType, setSelectedUploadType] = useState<DocumentRecord['document_type']>('receipt')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const records = await fetchUserDocuments(user.id)
      setDocs(records)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch documents.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Listen for global product additions that also upload documents
  useEffect(() => {
    const handleRefresh = () => loadData()
    window.addEventListener('proofpocket:product-added', handleRefresh)
    return () => window.removeEventListener('proofpocket:product-added', handleRefresh)
  }, [loadData])

  // File upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return
    const file = files[0]

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadErrorMsg('File exceeds 15MB limit. Please upload a smaller document.')
      return
    }

    setIsUploading(true)
    setUploadErrorMsg(null)
    setUploadSuccessMsg(null)

    try {
      await uploadStandaloneDocument(user.id, file, selectedUploadType)
      setUploadSuccessMsg(`Successfully uploaded and protected “${file.name}”.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadData()
    } catch (err: any) {
      setUploadErrorMsg(err?.message || 'Upload failed. Ensure Supabase storage is active.')
    } finally {
      setIsUploading(false)
    }
  }

  // Delete document handler
  const handleDeleteDoc = async (doc: DocumentRecord) => {
    if (!window.confirm(`Are you sure you want to permanently delete “${doc.file_name}”?`)) {
      return
    }
    try {
      await deleteDocument(doc.id, doc.storage_path)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`)
    }
  }

  // Filtered documents
  const filtered = docs.filter((d) => {
    const matchType = typeFilter === 'all' || d.document_type === typeFilter
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      d.file_name.toLowerCase().includes(q) ||
      (d.product_name && d.product_name.toLowerCase().includes(q))
    return matchType && matchSearch
  })

  // Format file size
  const formatSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

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
            Encrypted Storage
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
            Document Vault
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--color-muted)',
              margin: 0,
            }}
          >
            {isLoading
              ? 'Loading secure storage records…'
              : `${docs.length} private documents stored · Authenticated signed URLs only`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => loadData()}
            className="btn-editorial-ghost"
            style={{ padding: '0.65rem 1rem' }}
            title="Refresh document records"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-coral"
            style={{ padding: '0.65rem 1.35rem' }}
          >
            <Plus size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* ── Upload Area ────────────────────────────────────────── */}
      <div
        className="card-editorial"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: '#FFFEFA',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              Secure Document Deposit
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>
              Files are stored privately in Supabase Storage with strict user RLS policies.
            </p>
          </div>

          {/* Document type selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 600 }}>Type:</span>
            <select
              value={selectedUploadType}
              onChange={(e) => setSelectedUploadType(e.target.value as any)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                color: 'var(--color-text)',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="receipt">Purchase Receipt</option>
              <option value="invoice">Tax Invoice / Bill</option>
              <option value="warranty_card">Warranty Certificate</option>
              <option value="manual">Product Manual</option>
              <option value="other">Other Document</option>
            </select>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Dropzone trigger */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--color-bg)',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <Upload size={32} color="var(--color-accent)" style={{ margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
            {isUploading ? 'Encrypting and uploading file…' : 'Click to select or drop receipts, bills, and warranty cards'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
            Supports PDF, JPG, PNG, and WebP up to 15MB.
          </div>
        </div>

        {/* Messages */}
        {uploadSuccessMsg && (
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
            <span>{uploadSuccessMsg}</span>
          </div>
        )}

        {uploadErrorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{uploadErrorMsg}</span>
          </div>
        )}
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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              id="docs-search"
              placeholder="Search by file name or linked product…"
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

          {/* Grid / List toggle */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="btn-editorial-ghost"
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                backgroundColor: viewMode === 'grid' ? 'var(--color-bg)' : 'transparent',
              }}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="btn-editorial-ghost"
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                backgroundColor: viewMode === 'list' ? 'var(--color-bg)' : 'transparent',
              }}
            >
              List
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700, marginRight: '0.25rem' }}>
            Document Types:
          </span>
          {[
            { key: 'all' as DocTypeFilter, label: 'All Files' },
            { key: 'receipt' as DocTypeFilter, label: 'Receipts' },
            { key: 'invoice' as DocTypeFilter, label: 'Invoices' },
            { key: 'warranty_card' as DocTypeFilter, label: 'Warranty Cards' },
            { key: 'manual' as DocTypeFilter, label: 'Manuals' },
            { key: 'other' as DocTypeFilter, label: 'Other' },
          ].map((tab) => {
            const isSelected = typeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
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
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Genuine Zero State (0 documents) ────────────────────── */}
      {!isLoading && docs.length === 0 && !error && (
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
            <Lock size={28} color="var(--color-accent)" />
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
            No documents deposited yet.
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
            ProofPocket AI secures your receipts, tax invoices, and warranty cards in private storage. Drop a file above
            or attach a receipt when registering a new product.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-coral"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            <Plus size={18} />
            <span>Deposit First Document</span>
          </button>
        </div>
      )}

      {/* ── Filter Miss ────────────────────────────────────────── */}
      {!isLoading && docs.length > 0 && filtered.length === 0 && (
        <div
          className="card-editorial"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <FileText size={32} color="var(--color-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
            }}
          >
            No documents match your filter
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Try resetting your search query or choosing “All Files”.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setTypeFilter('all')
            }}
            className="btn-editorial-ghost"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Grid View ───────────────────────────────────────────── */}
      {!isLoading && filtered.length > 0 && viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((doc) => {
            const isPdf = doc.file_name.toLowerCase().endsWith('.pdf') || doc.mime_type?.includes('pdf')

            return (
              <div
                key={doc.id}
                className="card-editorial"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                }}
              >
                {/* Document Preview Box */}
                <div
                  style={{
                    height: '110px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {isPdf ? (
                    <FileText size={36} color="var(--color-accent)" />
                  ) : (
                    <ImageIcon size={36} color="var(--color-accent)" />
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {isPdf ? 'PDF Document' : 'Image File'}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-muted)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {formatSize(doc.file_size)} · {formatDisplayDate(doc.created_at)}
                  </div>

                  {doc.product_name && (
                    <div
                      style={{
                        marginTop: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                      }}
                    >
                      Linked: {doc.product_name}
                    </div>
                  )}
                </div>

                {/* Actions footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '0.75rem',
                    marginTop: 'auto',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {doc.document_type || 'receipt'}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {doc.signed_url && (
                      <a
                        href={doc.signed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-editorial-ghost"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        title="View document in new tab"
                      >
                        <ExternalLink size={12} />
                        <span>View</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteDoc(doc)}
                      className="btn-editorial-ghost"
                      style={{ padding: '0.35rem 0.55rem', color: '#991B1B' }}
                      title="Delete document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── List View ───────────────────────────────────────────── */}
      {!isLoading && filtered.length > 0 && viewMode === 'list' && (
        <div
          className="card-editorial"
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto',
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
            <span>File Name & Linked Asset</span>
            <span>Type</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {filtered.map((doc, index) => {
            const isLast = index === filtered.length - 1
            const isPdf = doc.file_name.toLowerCase().endsWith('.pdf') || doc.mime_type?.includes('pdf')

            return (
              <div
                key={doc.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1fr 1fr 1fr auto',
                  padding: '1.1rem 1.5rem',
                  alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isPdf ? (
                      <FileText size={18} color="var(--color-accent)" />
                    ) : (
                      <ImageIcon size={18} color="var(--color-accent)" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                      }}
                    >
                      {doc.file_name}
                    </div>
                    {doc.product_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                        Linked: {doc.product_name}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {doc.document_type || 'receipt'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  {formatSize(doc.file_size)}
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  {formatDisplayDate(doc.created_at)}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  {doc.signed_url && (
                    <a
                      href={doc.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-editorial-ghost"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <ExternalLink size={12} />
                      <span>View</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteDoc(doc)}
                    className="btn-editorial-ghost"
                    style={{ padding: '0.35rem 0.55rem', color: '#991B1B' }}
                    title="Delete document"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
