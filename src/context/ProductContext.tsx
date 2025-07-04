'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  category: string
  createdAt: Date
}

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  refetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: number, updatedProduct: Partial<Product>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined)

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

const fetchProducts = async () => {
  try {
    const res = await axios.get('/api/products')
    const productsWithDates = res.data.map((p: Product) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }))
    setProducts(productsWithDates)
    setError(null)
  } catch (err: unknown) {
    setError(
      typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to fetch products'
    )
  } finally {
    setLoading(false)
  }
}

const addProduct = async (newProduct: {
  name: string
  description?: string
  price: number
  category: string
}) => {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Failed to add product')
    }

    const productRaw = await res.json()

    // Parse createdAt to Date object
    const product: Product = {
      ...productRaw,
      createdAt: new Date(productRaw.createdAt),
    }

    // Add product at the start (since you're ordering by createdAt desc)
    setProducts(prev => [product, ...prev])

    return product
  } catch (error) {
    console.error('Error in addProduct:', error)
    throw error
  }
}


  const updateProduct = async (id: number, updatedProduct: Partial<Product>) => {
    try {
      await axios.put(`/api/products/${id}`, updatedProduct)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p))
    } catch (err) {
      console.error('Update product error:', err)
      throw err
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      await axios.delete(`/api/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Delete product error:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refetchProducts: fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export const useProductContext = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider')
  }
  return context
}