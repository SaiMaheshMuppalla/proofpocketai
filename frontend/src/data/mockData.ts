/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MOCK DATA — Visual Prototype Only
 * ─────────────────────────────────────────────────────────────────────────────
 * This file contains HARDCODED sample data for the Phase 1 frontend prototype.
 * It is NOT connected to any backend or database.
 *
 * When Phase 3 (Upload) and Phase 4 (AI Extraction) are built, every page
 * that imports from here will be updated to fetch real data from the FastAPI
 * backend → Supabase instead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type Category =
  | 'Electronics'
  | 'Groceries'
  | 'Clothing'
  | 'Appliances'
  | 'Furniture'
  | 'Travel'
  | 'Healthcare'
  | 'Books';

export type DocStatus = 'processed' | 'pending' | 'failed';
export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export interface Purchase {
  id: string;
  merchantName: string;
  category: Category;
  date: string;           // ISO date string, e.g. "2026-09-15"
  total: number;          // in INR
  itemCount: number;
  documentId: string;     // links to Document
  tags: string[];
}

export interface Document {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  uploadedAt: string;
  status: DocStatus;
  purchaseId: string;
  previewEmoji: string;   // placeholder until real thumbnails in Phase 3
  sizekb: number;
}

export interface WarrantyItem {
  id: string;
  productName: string;
  merchantName: string;
  purchaseDate: string;
  warrantyExpiryDate: string;
  status: WarrantyStatus;
  daysRemaining: number;   // negative = already expired
  category: Category;
  documentId: string;
  coverageDetails: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;       // e.g. "+3 this month"
  positive: boolean;
  icon: string;         // emoji, replaced with Lucide in components
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const MOCK_STATS: DashboardStat[] = [
  { label: 'Total Documents',   value: '47',        change: '+5 this month',     positive: true,  icon: 'FileText'   },
  { label: 'Total Spending',    value: '₹1,84,320', change: '+₹12,400 this month', positive: false, icon: 'IndianRupee'},
  { label: 'Active Warranties', value: '12',        change: '3 expiring soon',   positive: false, icon: 'Shield'     },
  { label: 'Purchases Tracked', value: '31',        change: '+4 this month',     positive: true,  icon: 'ShoppingBag'},
];

// ── Purchases ─────────────────────────────────────────────────────────────────

export const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'p-001',
    merchantName: 'Amazon India',
    category: 'Electronics',
    date: '2026-10-05',
    total: 24999,
    itemCount: 1,
    documentId: 'd-001',
    tags: ['laptop', 'dell', 'work'],
  },
  {
    id: 'p-002',
    merchantName: 'Reliance Smart',
    category: 'Groceries',
    date: '2026-10-08',
    total: 1840,
    itemCount: 14,
    documentId: 'd-002',
    tags: ['monthly', 'groceries'],
  },
  {
    id: 'p-003',
    merchantName: 'Myntra',
    category: 'Clothing',
    date: '2026-09-28',
    total: 3499,
    itemCount: 3,
    documentId: 'd-003',
    tags: ['fashion', 'sale'],
  },
  {
    id: 'p-004',
    merchantName: 'Croma',
    category: 'Appliances',
    date: '2026-09-15',
    total: 42000,
    itemCount: 1,
    documentId: 'd-004',
    tags: ['lg', 'refrigerator', 'kitchen'],
  },
  {
    id: 'p-005',
    merchantName: 'BookMyShow',
    category: 'Travel',
    date: '2026-09-10',
    total: 1200,
    itemCount: 2,
    documentId: 'd-005',
    tags: ['movie', 'entertainment'],
  },
  {
    id: 'p-006',
    merchantName: 'Apollo Pharmacy',
    category: 'Healthcare',
    date: '2026-10-01',
    total: 680,
    itemCount: 5,
    documentId: 'd-006',
    tags: ['medicine', 'monthly'],
  },
  {
    id: 'p-007',
    merchantName: 'IKEA',
    category: 'Furniture',
    date: '2026-08-20',
    total: 18500,
    itemCount: 4,
    documentId: 'd-007',
    tags: ['home', 'desk', 'chair'],
  },
  {
    id: 'p-008',
    merchantName: 'Flipkart',
    category: 'Electronics',
    date: '2026-08-12',
    total: 8999,
    itemCount: 1,
    documentId: 'd-008',
    tags: ['oneplus', 'earbuds'],
  },
  {
    id: 'p-009',
    merchantName: 'D-Mart',
    category: 'Groceries',
    date: '2026-10-10',
    total: 2200,
    itemCount: 18,
    documentId: 'd-009',
    tags: ['monthly', 'household'],
  },
  {
    id: 'p-010',
    merchantName: 'Penguin Books India',
    category: 'Books',
    date: '2026-09-05',
    total: 950,
    itemCount: 3,
    documentId: 'd-010',
    tags: ['books', 'aiml', 'study'],
  },
];

// ── Documents ─────────────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'd-001', fileName: 'Amazon_Dell_Laptop_Invoice.jpg',   fileType: 'image', uploadedAt: '2026-10-05', status: 'processed', purchaseId: 'p-001', previewEmoji: '💻', sizekb: 842  },
  { id: 'd-002', fileName: 'Reliance_Smart_Oct_Bill.jpg',      fileType: 'image', uploadedAt: '2026-10-08', status: 'processed', purchaseId: 'p-002', previewEmoji: '🛒', sizekb: 310  },
  { id: 'd-003', fileName: 'Myntra_Order_Receipt.pdf',         fileType: 'pdf',   uploadedAt: '2026-09-28', status: 'processed', purchaseId: 'p-003', previewEmoji: '👕', sizekb: 128  },
  { id: 'd-004', fileName: 'Croma_LG_Fridge_Invoice.pdf',      fileType: 'pdf',   uploadedAt: '2026-09-15', status: 'processed', purchaseId: 'p-004', previewEmoji: '🧊', sizekb: 540  },
  { id: 'd-005', fileName: 'BookMyShow_Tickets.jpg',           fileType: 'image', uploadedAt: '2026-09-10', status: 'processed', purchaseId: 'p-005', previewEmoji: '🎬', sizekb: 205  },
  { id: 'd-006', fileName: 'Apollo_Pharmacy_Bill.jpg',         fileType: 'image', uploadedAt: '2026-10-01', status: 'processed', purchaseId: 'p-006', previewEmoji: '💊', sizekb: 189  },
  { id: 'd-007', fileName: 'IKEA_Furniture_Receipt.pdf',       fileType: 'pdf',   uploadedAt: '2026-08-20', status: 'processed', purchaseId: 'p-007', previewEmoji: '🪑', sizekb: 624  },
  { id: 'd-008', fileName: 'Flipkart_OnePlus_Buds.jpg',        fileType: 'image', uploadedAt: '2026-08-12', status: 'processed', purchaseId: 'p-008', previewEmoji: '🎧', sizekb: 371  },
  { id: 'd-009', fileName: 'DMart_Oct_Grocery_Bill.jpg',       fileType: 'image', uploadedAt: '2026-10-10', status: 'pending',   purchaseId: 'p-009', previewEmoji: '🧴', sizekb: 445  },
  { id: 'd-010', fileName: 'Penguin_Books_Order.pdf',          fileType: 'pdf',   uploadedAt: '2026-09-05', status: 'processed', purchaseId: 'p-010', previewEmoji: '📚', sizekb: 98   },
  { id: 'd-011', fileName: 'Airtel_Sep_Broadband.pdf',         fileType: 'pdf',   uploadedAt: '2026-09-03', status: 'processed', purchaseId: 'p-001', previewEmoji: '📡', sizekb: 76   },
  { id: 'd-012', fileName: 'Zomato_Receipt_Blurred.jpg',       fileType: 'image', uploadedAt: '2026-10-11', status: 'failed',    purchaseId: 'p-002', previewEmoji: '🍕', sizekb: 612  },
];

// ── Warranty Items ────────────────────────────────────────────────────────────

export const MOCK_WARRANTIES: WarrantyItem[] = [
  {
    id: 'w-001',
    productName: 'Dell Inspiron 15 Laptop',
    merchantName: 'Amazon India',
    purchaseDate: '2026-10-05',
    warrantyExpiryDate: '2027-10-05',
    status: 'active',
    daysRemaining: 358,
    category: 'Electronics',
    documentId: 'd-001',
    coverageDetails: '1-year manufacturer warranty. Covers hardware defects. Excludes physical damage.',
  },
  {
    id: 'w-002',
    productName: 'LG 265L Double Door Refrigerator',
    merchantName: 'Croma',
    purchaseDate: '2026-09-15',
    warrantyExpiryDate: '2031-09-15',
    status: 'active',
    daysRemaining: 1798,
    category: 'Appliances',
    documentId: 'd-004',
    coverageDetails: '5-year comprehensive warranty. Compressor warranty: 10 years.',
  },
  {
    id: 'w-003',
    productName: 'OnePlus Buds 3',
    merchantName: 'Flipkart',
    purchaseDate: '2026-08-12',
    warrantyExpiryDate: '2027-08-12',
    status: 'active',
    daysRemaining: 303,
    category: 'Electronics',
    documentId: 'd-008',
    coverageDetails: '1-year limited warranty. Manufacturing defects only.',
  },
  {
    id: 'w-004',
    productName: 'IKEA Markus Office Chair',
    merchantName: 'IKEA',
    purchaseDate: '2026-08-20',
    warrantyExpiryDate: '2036-08-20',
    status: 'active',
    daysRemaining: 3600,
    category: 'Furniture',
    documentId: 'd-007',
    coverageDetails: '10-year limited warranty on frame. 2-year on upholstery.',
  },
  {
    id: 'w-005',
    productName: 'Samsung Galaxy Tab S8',
    merchantName: 'Samsung India',
    purchaseDate: '2025-10-20',
    warrantyExpiryDate: '2026-10-20',
    status: 'expiring_soon',
    daysRemaining: 8,
    category: 'Electronics',
    documentId: 'd-005',
    coverageDetails: '1-year warranty. Expires Oct 20, 2026. Service centres available across India.',
  },
  {
    id: 'w-006',
    productName: 'Bosch Washing Machine',
    merchantName: 'Vijay Sales',
    purchaseDate: '2025-11-01',
    warrantyExpiryDate: '2026-11-01',
    status: 'expiring_soon',
    daysRemaining: 20,
    category: 'Appliances',
    documentId: 'd-006',
    coverageDetails: '2-year warranty. Motor warranty: 5 years. Expires Nov 1, 2026.',
  },
  {
    id: 'w-007',
    productName: 'HP LaserJet Printer',
    merchantName: 'HP India',
    purchaseDate: '2024-09-10',
    warrantyExpiryDate: '2025-09-10',
    status: 'expired',
    daysRemaining: -32,
    category: 'Electronics',
    documentId: 'd-008',
    coverageDetails: '1-year warranty. EXPIRED on Sep 10, 2025.',
  },
  {
    id: 'w-008',
    productName: 'Mi Smart TV 43"',
    merchantName: 'Xiaomi India',
    purchaseDate: '2023-12-15',
    warrantyExpiryDate: '2024-12-15',
    status: 'expired',
    daysRemaining: -301,
    category: 'Electronics',
    documentId: 'd-009',
    coverageDetails: '1-year warranty. EXPIRED. Extended warranty available via Mi Care.',
  },
];

// ── Recent Activity (for Dashboard feed) ─────────────────────────────────────

export interface Activity {
  id: string;
  type: 'upload' | 'warranty_alert' | 'purchase';
  description: string;
  time: string;
  icon: string;
}

export const MOCK_ACTIVITY: Activity[] = [
  { id: 'a-1', type: 'upload',         description: 'D-Mart grocery bill uploaded — processing',  time: '2 hours ago',  icon: '📄' },
  { id: 'a-2', type: 'warranty_alert', description: 'Samsung Galaxy Tab warranty expires in 8 days', time: '1 day ago',  icon: '⚠️' },
  { id: 'a-3', type: 'purchase',       description: 'Amazon purchase ₹24,999 logged',            time: '7 days ago',  icon: '🛍️' },
  { id: 'a-4', type: 'upload',         description: 'Apollo Pharmacy bill processed',             time: '11 days ago', icon: '✅' },
  { id: 'a-5', type: 'warranty_alert', description: 'Bosch Washing Machine warranty in 20 days', time: '12 days ago', icon: '⚠️' },
];

// ── Spending by category (for Dashboard chart placeholder) ────────────────────

export const MOCK_SPENDING_BY_CATEGORY = [
  { category: 'Electronics',  amount: 33998,  color: '#6c63ff' },
  { category: 'Appliances',   amount: 42000,  color: '#22d3a1' },
  { category: 'Furniture',    amount: 18500,  color: '#fbbf24' },
  { category: 'Groceries',    amount:  4040,  color: '#a78bfa' },
  { category: 'Clothing',     amount:  3499,  color: '#f87171' },
  { category: 'Others',       amount:  2830,  color: '#64748b' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<Category, string> = {
  Electronics: '#6c63ff',
  Groceries:   '#22d3a1',
  Clothing:    '#f87171',
  Appliances:  '#fbbf24',
  Furniture:   '#a78bfa',
  Travel:      '#34d399',
  Healthcare:  '#fb923c',
  Books:       '#60a5fa',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  Electronics: '💻',
  Groceries:   '🛒',
  Clothing:    '👕',
  Appliances:  '🏠',
  Furniture:   '🪑',
  Travel:      '✈️',
  Healthcare:  '💊',
  Books:       '📚',
};

/** Format a number as Indian Rupees */
export const formatINR = (amount: number): string =>
  '₹' + amount.toLocaleString('en-IN');

/** Format ISO date to readable form */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
