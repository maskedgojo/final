import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'

type Props = {
  params: { id: string }
}

export default async function ProductModal({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: Number(params.id) },
  })

  if (!product) return notFound()

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Backdrop that closes modal when clicked */}
      <Link 
        href="/dashboard/product" 
        className="absolute inset-0" 
        aria-label="Close modal"
      />
      
      {/* Modal container */}
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scaleIn relative border border-gray-100">
        {/* Close button */}
        <Link
          href="/dashboard/product"
          className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:scale-105 transition-transform"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
        </Link>
        
        {/* Content */}
        <div className="mb-1">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-2">
            {product.category}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">
          {product.name}
        </h2>
        
        <p className="text-gray-600 mb-4 min-h-[60px]">
          {product.description || 'No description provided.'}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-indigo-600 font-bold text-xl">
            ${product.price.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            Added: {new Date(product.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  )
}