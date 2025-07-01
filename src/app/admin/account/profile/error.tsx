'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    toast.error(error.message || 'Profile load failed')
    
    // Redirect if unauthorized
    if (error.message.includes('authenticated')) {
      router.push('/login')
    }
  }, [error, router])

  return (
    <div className="min-h-screen p-8 bg-[#F5F6FA] flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow text-center max-w-md">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Profile Error
        </h2>
        <p className="mb-6">{error.message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}