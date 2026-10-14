-- ─────────────────────────────────────────────────────────────────────────────
-- PROOFPOCKET AI — COMPLETE DATABASE & STORAGE MIGRATION
-- ─────────────────────────────────────────────────────────────────────────────
-- Instructions: Run this in your Supabase Project -> SQL Editor -> Run
-- This migration extends the existing schema without deleting any data.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. EXTEND PURCHASES TABLE WITH DETAILED PRODUCT & WARRANTY COLUMNS
ALTER TABLE IF EXISTS public.purchases
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Electronics',
  ADD COLUMN IF NOT EXISTS serial_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS warranty_provider TEXT,
  ADD COLUMN IF NOT EXISTS warranty_start_date DATE,
  ADD COLUMN IF NOT EXISTS warranty_duration INTEGER,
  ADD COLUMN IF NOT EXISTS warranty_duration_unit TEXT DEFAULT 'months',
  ADD COLUMN IF NOT EXISTS warranty_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS warranty_status TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS return_deadline DATE,
  ADD COLUMN IF NOT EXISTS extended_warranty TEXT,
  ADD COLUMN IF NOT EXISTS coverage_details TEXT,
  ADD COLUMN IF NOT EXISTS service_contact TEXT,
  ADD COLUMN IF NOT EXISTS warranty_notes TEXT,
  ADD COLUMN IF NOT EXISTS warranty_verified_status TEXT DEFAULT 'user_entered';

-- 2. EXTEND DOCUMENTS TABLE
ALTER TABLE IF EXISTS public.documents
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'receipt',
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- 3. ENSURE ROW LEVEL SECURITY (RLS) ON ALL CORE TABLES
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR PURCHASES
DROP POLICY IF EXISTS "Users can only access their own purchases" ON public.purchases;
CREATE POLICY "Users can only access their own purchases"
  ON public.purchases
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. RLS POLICIES FOR DOCUMENTS
DROP POLICY IF EXISTS "Users can only access their own documents" ON public.documents;
CREATE POLICY "Users can only access their own documents"
  ON public.documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. RLS POLICIES FOR PURCHASE_DOCUMENTS
DROP POLICY IF EXISTS "Users can only access their own purchase document links" ON public.purchase_documents;
CREATE POLICY "Users can only access their own purchase document links"
  ON public.purchase_documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS POLICIES FOR EXTRACTED_FIELDS
DROP POLICY IF EXISTS "Users can only access their own extracted fields" ON public.extracted_fields;
CREATE POLICY "Users can only access their own extracted fields"
  ON public.extracted_fields
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. CONFIGURE PRIVATE STORAGE BUCKET FOR RECEIPTS AND WARRANTY CARDS
-- Creates the 'receipts' private bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Storage RLS: Users can upload, read, and delete their own files in the 'receipts' bucket
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Authenticated users can view own receipts" ON storage.objects;
CREATE POLICY "Authenticated users can view own receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Authenticated users can delete own receipts" ON storage.objects;
CREATE POLICY "Authenticated users can delete own receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
