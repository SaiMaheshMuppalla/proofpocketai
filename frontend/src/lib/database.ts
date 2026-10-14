import { supabase, isSupabaseConfigured } from './supabase'

export interface DocumentRecord {
  id: string
  user_id: string
  file_name: string
  storage_path?: string | null
  document_type: 'receipt' | 'invoice' | 'warranty_card' | 'manual' | 'extended_warranty' | 'other'
  file_size?: number | null
  mime_type?: string | null
  signed_url?: string | null
  created_at?: string
  purchase_id?: string | null
  product_name?: string | null
}

export interface ProductRecord {
  id: string
  user_id: string
  product_name: string
  brand?: string | null
  model?: string | null
  category: string
  serial_number?: string | null
  seller?: string | null
  amount?: number | null
  currency: string
  purchase_date?: string | null
  invoice_number?: string | null
  notes?: string | null
  warranty_provider?: string | null
  warranty_start_date?: string | null
  warranty_duration?: number | null
  warranty_duration_months?: number | null
  warranty_duration_unit?: 'months' | 'years' | null
  warranty_expiry_date?: string | null
  warranty_status: 'active' | 'expiring_soon' | 'expired' | 'unknown'
  return_deadline?: string | null
  extended_warranty?: string | null
  coverage_details?: string | null
  service_contact?: string | null
  warranty_notes?: string | null
  warranty_verified_status: 'user_entered' | 'verified' | 'ai_extracted' | 'unknown'
  created_at?: string
  updated_at?: string
  documents?: DocumentRecord[]
}

export interface CreateProductInput {
  product_name: string
  brand?: string
  model?: string
  category?: string
  serial_number?: string
  seller?: string
  amount?: number
  currency?: string
  purchase_date?: string
  invoice_number?: string
  notes?: string
  warranty_provider?: string
  warranty_start_date?: string
  warranty_duration?: number
  warranty_duration_months?: number
  warranty_duration_unit?: 'months' | 'years'
  warranty_expiry_date?: string
  return_deadline?: string
  extended_warranty?: string
  coverage_details?: string
  service_contact?: string
  warranty_notes?: string
  warranty_verified_status?: 'user_entered' | 'verified' | 'ai_extracted' | 'unknown'
}

/**
 * Formats an ISO date into a human readable display string.
 */
export function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Accurately calculates warranty expiry date given a start date and duration.
 */
export function calculateWarrantyExpiry(
  startDateStr: string,
  duration: number,
  unit: 'months' | 'years' = 'months'
): string | null {
  if (!startDateStr || !duration || isNaN(duration) || duration <= 0) return null
  const d = new Date(startDateStr)
  if (isNaN(d.getTime())) return null

  if (unit === 'years') {
    d.setFullYear(d.getFullYear() + Number(duration))
  } else {
    d.setMonth(d.getMonth() + Number(duration))
  }

  return d.toISOString().split('T')[0]
}

/**
 * Calculates warranty status based on real dates without fabricating deadlines.
 */
export function calculateWarrantyStatus(
  expiryDateStr?: string | null
): 'active' | 'expiring_soon' | 'expired' | 'unknown' {
  if (!expiryDateStr) return 'unknown'
  const expiry = new Date(expiryDateStr)
  if (isNaN(expiry.getTime())) return 'unknown'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring_soon'
  return 'active'
}

/**
 * Returns the number of days remaining until warranty expiry, or null if unknown.
 */
export function getDaysRemaining(expiryDateStr?: string | null): number | null {
  if (!expiryDateStr) return null
  const expiry = new Date(expiryDateStr)
  if (isNaN(expiry.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formats a currency value with proper symbols.
 */
export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN')
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

/**
 * Fetches all products and their linked documents for the authenticated user.
 */
export async function fetchUserProducts(userId: string): Promise<ProductRecord[]> {
  if (!isSupabaseConfigured || !userId) return []

  try {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Database] Failed to fetch purchases:', error)
      throw new Error(error.message)
    }

    if (!purchases || purchases.length === 0) return []

    // Fetch linked documents
    const purchaseIds = purchases.map((p) => p.id)
    const { data: links } = await supabase
      .from('purchase_documents')
      .select('purchase_id, document_id, documents(*)')
      .in('purchase_id', purchaseIds)

    const docMap = new Map<string, DocumentRecord[]>()
    if (links) {
      for (const link of links) {
        if (link.documents) {
          const doc = link.documents as unknown as DocumentRecord
          const list = docMap.get(link.purchase_id) || []
          list.push(doc)
          docMap.set(link.purchase_id, list)
        }
      }
    }

    return purchases.map((p) => {
      const expiry = p.warranty_expiry_date || null
      const status = calculateWarrantyStatus(expiry)
      return {
        ...p,
        category: p.category || 'Electronics',
        currency: p.currency || 'INR',
        warranty_status: status,
        warranty_verified_status: p.warranty_verified_status || (expiry ? 'user_entered' : 'unknown'),
        documents: docMap.get(p.id) || [],
      } as ProductRecord
    })
  } catch (err) {
    console.error('[Database] fetchUserProducts exception:', err)
    throw err
  }
}

/**
 * Creates a new product and warranty record in Supabase.
 */
export async function createProduct(
  userId: string,
  input: CreateProductInput
): Promise<ProductRecord> {
  if (!isSupabaseConfigured || !userId) {
    throw new Error('Supabase is not configured or user is unauthenticated.')
  }

  const expiry =
    input.warranty_expiry_date ||
    (input.warranty_start_date && input.warranty_duration
      ? calculateWarrantyExpiry(input.warranty_start_date, input.warranty_duration, input.warranty_duration_unit)
      : null)

  const status = calculateWarrantyStatus(expiry)

  const payload: Record<string, unknown> = {
    user_id: userId,
    product_name: input.product_name.trim(),
    brand: input.brand?.trim() || null,
    model: input.model?.trim() || null,
    category: input.category?.trim() || 'Electronics',
    serial_number: input.serial_number?.trim() || null,
    seller: input.seller?.trim() || null,
    amount: input.amount !== undefined && !isNaN(Number(input.amount)) ? Number(input.amount) : null,
    currency: input.currency?.trim() || 'INR',
    purchase_date: input.purchase_date || null,
    invoice_number: input.invoice_number?.trim() || null,
    notes: input.notes?.trim() || null,
    warranty_provider: input.warranty_provider?.trim() || null,
    warranty_start_date: input.warranty_start_date || null,
    warranty_duration: input.warranty_duration ? Number(input.warranty_duration) : null,
    warranty_duration_unit: input.warranty_duration_unit || 'months',
    warranty_expiry_date: expiry,
    warranty_status: status,
    return_deadline: input.return_deadline || null,
    extended_warranty: input.extended_warranty?.trim() || null,
    coverage_details: input.coverage_details?.trim() || null,
    service_contact: input.service_contact?.trim() || null,
    warranty_notes: input.warranty_notes?.trim() || null,
    warranty_verified_status: input.warranty_verified_status || (expiry ? 'user_entered' : 'unknown'),
  }

  // Attempt insert with all extended columns
  const { data, error } = await supabase
    .from('purchases')
    .insert([payload])
    .select()
    .single()

  if (error) {
    // If a column is missing in older table schema (e.g. before SQL migration is executed in Supabase)
    if (error.code === 'PGRST204' || error.message.includes('column')) {
      console.warn('[Database] Column mismatch detected, falling back to core schema fields:', error.message)
      const corePayload = {
        user_id: userId,
        product_name: input.product_name.trim(),
        amount: input.amount ? Number(input.amount) : null,
        currency: input.currency || 'INR',
        purchase_date: input.purchase_date || null,
        seller: input.seller?.trim() || null,
      }
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('purchases')
        .insert([corePayload])
        .select()
        .single()

      if (fallbackError) {
        throw new Error(fallbackError.message)
      }
      return {
        ...fallbackData,
        ...payload,
        id: fallbackData.id,
        documents: [],
      } as ProductRecord
    }
    throw new Error(error.message)
  }

  return { ...data, documents: [] } as ProductRecord
}

/**
 * Updates an existing product and its warranty information.
 */
export async function updateProduct(
  productId: string,
  input: Partial<CreateProductInput>
): Promise<ProductRecord> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const expiry =
    input.warranty_expiry_date !== undefined
      ? input.warranty_expiry_date
      : input.warranty_start_date && input.warranty_duration
      ? calculateWarrantyExpiry(input.warranty_start_date, input.warranty_duration, input.warranty_duration_unit)
      : undefined

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.product_name !== undefined) payload.product_name = input.product_name.trim()
  if (input.brand !== undefined) payload.brand = input.brand?.trim() || null
  if (input.model !== undefined) payload.model = input.model?.trim() || null
  if (input.category !== undefined) payload.category = input.category?.trim() || 'Electronics'
  if (input.serial_number !== undefined) payload.serial_number = input.serial_number?.trim() || null
  if (input.seller !== undefined) payload.seller = input.seller?.trim() || null
  if (input.amount !== undefined) payload.amount = input.amount !== null ? Number(input.amount) : null
  if (input.currency !== undefined) payload.currency = input.currency || 'INR'
  if (input.purchase_date !== undefined) payload.purchase_date = input.purchase_date || null
  if (input.invoice_number !== undefined) payload.invoice_number = input.invoice_number?.trim() || null
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null
  if (input.warranty_provider !== undefined) payload.warranty_provider = input.warranty_provider?.trim() || null
  if (input.warranty_start_date !== undefined) payload.warranty_start_date = input.warranty_start_date || null
  if (input.warranty_duration !== undefined) payload.warranty_duration = input.warranty_duration ? Number(input.warranty_duration) : null
  if (input.warranty_duration_unit !== undefined) payload.warranty_duration_unit = input.warranty_duration_unit || 'months'
  if (expiry !== undefined) {
    payload.warranty_expiry_date = expiry
    payload.warranty_status = calculateWarrantyStatus(expiry)
  }
  if (input.return_deadline !== undefined) payload.return_deadline = input.return_deadline || null
  if (input.extended_warranty !== undefined) payload.extended_warranty = input.extended_warranty?.trim() || null
  if (input.coverage_details !== undefined) payload.coverage_details = input.coverage_details?.trim() || null
  if (input.service_contact !== undefined) payload.service_contact = input.service_contact?.trim() || null
  if (input.warranty_notes !== undefined) payload.warranty_notes = input.warranty_notes?.trim() || null
  if (input.warranty_verified_status !== undefined) payload.warranty_verified_status = input.warranty_verified_status

  const { data, error } = await supabase
    .from('purchases')
    .update(payload)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error('[Database] Failed to update product:', error)
    throw new Error(error.message)
  }

  return data as ProductRecord
}

/**
 * Deletes a product and cleans up any linked documents.
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  try {
    // 1. Delete links in purchase_documents
    await supabase.from('purchase_documents').delete().eq('purchase_id', productId)

    // 2. Delete purchase record
    const { error } = await supabase.from('purchases').delete().eq('id', productId)
    if (error) throw new Error(error.message)

    return true
  } catch (err) {
    console.error('[Database] Failed to delete product:', err)
    throw err
  }
}

/**
 * Uploads a document to Supabase Storage and links it to a purchase record.
 */
export async function uploadProductDocument(
  userId: string,
  productId: string,
  file: File,
  documentType: DocumentRecord['document_type'] = 'receipt'
): Promise<DocumentRecord> {
  if (!isSupabaseConfigured || !userId) {
    throw new Error('Supabase is not configured or user is unauthenticated.')
  }

  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${userId}/${timestamp}_${sanitizedName}`

  let storageUploadSuccess = false

  try {
    // 1. Upload to Supabase Storage bucket 'receipts'
    const { error: storageError } = await supabase.storage
      .from('receipts')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!storageError) {
      storageUploadSuccess = true
    } else {
      console.warn('[Storage] Supabase bucket upload notice:', storageError.message)
    }

    // 2. Insert document metadata row in documents table
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          storage_path: storageUploadSuccess ? storagePath : null,
          document_type: documentType,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
        },
      ])
      .select()
      .single()

    if (docError) {
      // Rollback uploaded storage file if database record insert fails
      if (storageUploadSuccess) {
        await supabase.storage.from('receipts').remove([storagePath])
      }
      throw new Error(`Failed to save document record: ${docError.message}`)
    }

    // 3. Link document to purchase in purchase_documents table
    const { error: linkError } = await supabase
      .from('purchase_documents')
      .insert([
        {
          purchase_id: productId,
          document_id: docData.id,
          user_id: userId,
        },
      ])

    if (linkError) {
      console.warn('[Database] Link error in purchase_documents:', linkError.message)
    }

    // 4. Generate signed URL for immediate secure display
    let signedUrl: string | null = null
    if (storageUploadSuccess) {
      const { data: signedData } = await supabase.storage
        .from('receipts')
        .createSignedUrl(storagePath, 3600) // 1-hour secure link
      signedUrl = signedData?.signedUrl || null
    }

    return {
      id: docData.id,
      user_id: userId,
      file_name: file.name,
      storage_path: storageUploadSuccess ? storagePath : null,
      document_type: documentType,
      file_size: file.size,
      mime_type: file.type,
      signed_url: signedUrl,
      created_at: docData.created_at,
      purchase_id: productId,
    }
  } catch (err) {
    console.error('[Storage] Upload error:', err)
    throw err
  }
}

/**
 * Fetches all documents uploaded by the user with their linked product details.
 */
export async function fetchUserDocuments(userId: string): Promise<DocumentRecord[]> {
  if (!isSupabaseConfigured || !userId) return []

  try {
    const { data: docs, error } = await supabase
      .from('documents')
      .select('*, purchase_documents(purchase_id, purchases(product_name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Database] Failed to fetch documents:', error)
      return []
    }

    const results: DocumentRecord[] = []

    for (const d of docs || []) {
      let signedUrl: string | null = null
      if (d.storage_path) {
        const { data: signed } = await supabase.storage
          .from('receipts')
          .createSignedUrl(d.storage_path, 3600)
        signedUrl = signed?.signedUrl || null
      }

      const pDoc = d.purchase_documents?.[0]
      results.push({
        id: d.id,
        user_id: d.user_id,
        file_name: d.file_name,
        storage_path: d.storage_path,
        document_type: d.document_type || 'receipt',
        file_size: d.file_size,
        mime_type: d.mime_type,
        signed_url: signedUrl,
        created_at: d.created_at,
        purchase_id: pDoc?.purchase_id || null,
        product_name: pDoc?.purchases?.product_name || null,
      })
    }

    return results
  } catch (err) {
    console.error('[Database] fetchUserDocuments error:', err)
    return []
  }
}

/**
 * Uploads a document directly without requiring an existing purchase record.
 */
export async function uploadStandaloneDocument(
  userId: string,
  file: File,
  documentType: DocumentRecord['document_type'] = 'receipt'
): Promise<DocumentRecord> {
  if (!isSupabaseConfigured || !userId) {
    throw new Error('Supabase is not configured or user is unauthenticated.')
  }

  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${userId}/${timestamp}_${sanitizedName}`
  let storageUploadSuccess = false

  try {
    const { error: storageError } = await supabase.storage
      .from('receipts')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (!storageError) {
      storageUploadSuccess = true
    } else {
      console.warn('[Storage] Upload note:', storageError.message)
    }

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          storage_path: storageUploadSuccess ? storagePath : null,
          document_type: documentType,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
        },
      ])
      .select()
      .single()

    if (docError) {
      if (storageUploadSuccess) {
        await supabase.storage.from('receipts').remove([storagePath])
      }
      throw new Error(`Failed to save document record: ${docError.message}`)
    }

    let signedUrl: string | null = null
    if (storageUploadSuccess) {
      const { data: signedData } = await supabase.storage
        .from('receipts')
        .createSignedUrl(storagePath, 3600)
      signedUrl = signedData?.signedUrl || null
    }

    return {
      id: docData.id,
      user_id: userId,
      file_name: file.name,
      storage_path: storageUploadSuccess ? storagePath : null,
      document_type: documentType,
      file_size: file.size,
      mime_type: file.type,
      signed_url: signedUrl,
      created_at: docData.created_at,
      purchase_id: null,
    }
  } catch (err) {
    console.error('[Storage] Upload error:', err)
    throw err
  }
}

/**
 * Deletes a document and its storage file.
 */
export async function deleteDocument(documentId: string, storagePath?: string | null): Promise<boolean> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  try {
    // 1. Remove storage file if path exists
    if (storagePath) {
      await supabase.storage.from('receipts').remove([storagePath])
    }

    // 2. Remove purchase_documents links
    await supabase.from('purchase_documents').delete().eq('document_id', documentId)

    // 3. Delete document record
    const { error } = await supabase.from('documents').delete().eq('id', documentId)
    if (error) throw new Error(error.message)

    return true
  } catch (err) {
    console.error('[Database] deleteDocument error:', err)
    throw err
  }
}
