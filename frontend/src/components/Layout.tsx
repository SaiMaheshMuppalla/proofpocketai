
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AddProductModal from './AddProductModal'
import { type ProductRecord } from '../lib/database'

export default function Layout() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleProductAdded = (_newProduct: ProductRecord) => {
    window.dispatchEvent(new CustomEvent('proofpocket:product-added'))
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'clip',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Left Sidebar */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Content Area */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: 0,
          maxWidth: '100%',
        }}
      >
        <TopBar onOpenAddModal={() => setIsAddModalOpen(true)} />

        {/* Responsive Page Content */}
        <main
          style={{
            flex: 1,
            padding: 'clamp(12px, 3vw, 32px) clamp(12px, 3vw, 36px)',
            width: '100%',
            maxWidth: '1380px',
            minWidth: 0,
            boxSizing: 'border-box',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleProductAdded}
      />
    </div>
  )
}
