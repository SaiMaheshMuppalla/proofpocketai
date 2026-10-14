import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AddProductModal from './AddProductModal'
import { type ProductRecord } from '../lib/database'

export default function Layout() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleProductAdded = (_newProduct: ProductRecord) => {
    // Dispatch a custom event so active pages (Dashboard, Purchases, Warranties) can reload
    window.dispatchEvent(new CustomEvent('proofpocket:product-added'))
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* ── Left Sidebar ────────────────────────────────────────── */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* ── Main Content Area ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top bar header */}
        <TopBar onOpenAddModal={() => setIsAddModalOpen(true)} />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: '2rem 2.25rem',
            maxWidth: '1380px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Add Product & Warranty Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleProductAdded}
      />
    </div>
  )
}
