'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useProductContext } from '@/context/ProductContext'

export default function ProductTable() {
  // ========================================
  // CONTEXT & ROUTER
  // ========================================
  const {
    products,
    loading: contextLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProductContext()
  const router = useRouter()

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [searchValue, setSearchValue] = useState('')
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '' 
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState<number | null>(null)
  
  // ========================================
  // REFS
  // ========================================
  const deletionTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const data = products
  const categories = [...new Set(data.map((p) => p.category))].sort()

  // ========================================
  // FILTERED DATA
  // ========================================
  const filtered = useMemo(() => {
    if (!searchValue.trim()) return data

    const searchLower = searchValue.toLowerCase()
    return data.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchLower) ||
        (p.description?.toLowerCase() || '').includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.price.toString().includes(searchValue) ||
        p.id.toString().includes(searchValue) ||
        new Date(p.createdAt).toISOString().includes(searchValue)

      )
    })
  }, [data, searchValue])

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    return () => {
      if (deletionTimerRef.current) clearTimeout(deletionTimerRef.current)
    }
  }, [])
  useEffect(() => {
  router.refresh?.() // For App Router hydration if needed
}, [products, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const editId = params.get('edit')
    const action = params.get('action')

    if (editId) {
      const id = parseInt(editId)
      const product = data.find((p) => p.id === id)
      if (product) {
        setEditMode(id)
        setForm({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          category: product.category,
        })
        setShowForm(true)
      }
    } else if (action === 'add') {
      setShowForm(true)
      setEditMode(null)
      setForm({ name: '', description: '', price: '', category: '' })
    }
  }, [data])

  // ========================================
  // CRUD HANDLERS
  // ========================================
 const handleAddProduct = async () => {
  if (!form.name || !form.price || !form.category) {
    toast.error('Name, price and category are required')
    return
  }

  setLoading(true)
  try {
    const product = await addProduct({
      ...form,
      price: parseFloat(form.price),
    })

    if (!product?.id) throw new Error('Invalid product response')

    setEditMode(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
    })

    const params = new URLSearchParams()
    params.set('edit', product.id.toString())
    router.replace(`?${params.toString()}`, { scroll: false })

    toast.success('Product added successfully')
  } catch (err) {
    console.error('Add failed:', err)
    toast.error('Add failed')
  } finally {
    setLoading(false)
  }
}

  const handleUpdateProduct = async (id: number) => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price and category are required')
      return
    }
    
    setLoading(true)
    try {
      await updateProduct(id, { ...form, price: parseFloat(form.price) })
      const params = new URLSearchParams()
      params.set('edit', id.toString())
      router.replace(`?${params.toString()}`, { scroll: false })
      toast.success('Product updated successfully')
    } catch{
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await deleteProduct(id)
      const params = new URLSearchParams(window.location.search)
      params.set('deleted', id.toString())
      router.replace(`?${params.toString()}`, { scroll: false })

      if (deletionTimerRef.current) clearTimeout(deletionTimerRef.current)
      deletionTimerRef.current = setTimeout(() => {
        const currentParams = new URLSearchParams(window.location.search)
        if (currentParams.get('deleted') === id.toString()) {
          currentParams.delete('deleted')
          router.replace(`?${currentParams.toString()}`, { scroll: false })
        }
      }, 3000)

      if (params.get('edit') === id.toString()) {
        params.delete('edit')
        router.replace(`?${params.toString()}`, { scroll: false })
        setEditMode(null)
        setShowForm(false)
      }

      toast.success('Product deleted successfully')
    } catch{
      toast.error('Delete failed')
    }
  }

  // ========================================
  // UI HANDLERS
  // ========================================
  const cancelForm = () => {
    const params = new URLSearchParams(window.location.search)
    params.delete('edit')
    params.delete('action')
    router.replace(`?${params.toString()}`, { scroll: false })

    setEditMode(null)
    setForm({ name: '', description: '', price: '', category: '' })
    setShowForm(false)
  }

  const startEditing = (product: typeof products[number]) => {
    const params = new URLSearchParams(window.location.search)
    params.set('edit', product.id.toString())
    router.replace(`?${params.toString()}`, { scroll: false })

    setEditMode(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
    })
    setShowForm(true)
  }

  const handleAddButtonClick = () => {
    if (showForm && !editMode) {
      cancelForm()
    } else {
      const params = new URLSearchParams(window.location.search)
      params.delete('edit')
      params.set('action', 'add')
      router.replace(`?${params.toString()}`, { scroll: false })
      
      setShowForm(true)
      setEditMode(null)
      setForm({ name: '', description: '', price: '', category: '' })
    }
  }

  const handleNoProductsAddClick = () => {
    setSearchValue('')
    const params = new URLSearchParams()
    params.set('action', 'add')
    router.replace(`?${params.toString()}`, { scroll: false })
    setShowForm(true)
  }

  // ========================================
  // RENDER COMPONENTS
  // ========================================
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Product Inventory</h1>
        <p className="text-gray-600 mt-1">Manage your product catalog efficiently</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-lg px-4 py-2 shadow">
          <span className="text-gray-600">Total Products:</span>
          <span className="text-gray-800 font-bold ml-2">{data.length}</span>
        </div>
        <button
          onClick={handleAddButtonClick}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-300 hover:shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {(showForm && !editMode) ? 'Cancel Add' : 'Add Product'}
        </button>
      </div>
    </div>
  )

  const renderSearchSection = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Search Products</h2>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-11 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="Search by name, category, price, or ID..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  )

  const renderForm = () => (
    (showForm || editMode !== null) && (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {editMode !== null ? 'Edit Product' : 'Add New Product'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input 
              placeholder="Product name" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              placeholder="Product description" 
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              onClick={cancelForm}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => editMode !== null ? handleUpdateProduct(editMode) : handleAddProduct()}
              disabled={loading}
              className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition duration-300 hover:shadow-lg ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {editMode !== null ? (loading ? 'Updating...' : 'Update Product') : (loading ? 'Adding...' : 'Add Product')}
            </button>
          </div>
        </div>
      </div>
    )
  )

  const renderLoadingState = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-gray-300 pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-300 rounded pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded pulse"></div>
            </div>
          </div>
          <div className="h-4 w-24 bg-gray-300 rounded pulse"></div>
          <div className="h-4 w-20 bg-gray-300 rounded pulse"></div>
          <div className="h-4 w-32 bg-gray-300 rounded pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-yellow-200 rounded-md pulse"></div>
            <div className="h-8 w-16 bg-red-200 rounded-md pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderProductTable = () => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filtered.map((product) => (
            <tr 
              key={product.id} 
              className={`hover:bg-gray-50 transition-all duration-150 ${editMode === product.id ? 'bg-indigo-50' : ''}`}
            >
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold">
                    {product.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </td>
              <td className="py-4 px-6 text-sm font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </td>
              <td className="py-4 px-6 text-sm text-gray-500">
                {new Date(product.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-6 text-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(product)}
                    className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or add a new product.</p>
          <div className="mt-6">
            <button
              onClick={handleNoProductsAddClick}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {renderHeader()}
        {renderSearchSection()}
        {renderForm()}
        {contextLoading ? renderLoadingState() : renderProductTable()}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  )
}