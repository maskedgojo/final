'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import Navbar from '@/components/ui/Navbar'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'login') {
      toast.success('Welcome! You are now logged in.')

      // Optional: Clean the URL by removing `?status=login`
      const url = new URL(window.location.href)
      url.searchParams.delete('status')
      window.history.replaceState({}, '', url.toString())
    }

    if (searchParams.get('error') === '1') {
      toast.error('Something went wrong. You’ve been redirected.')
    }
  }, [searchParams])

  const handleSidebarOpen = () => setIsSidebarOpen(true)
  const handleSidebarClose = () => setIsSidebarOpen(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Add ToastContainer (only once!) */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full">
        <Navbar onMenuClick={handleSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
