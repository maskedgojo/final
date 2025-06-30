import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import ProductTable from '@/components/ProductTable'


export default async function ProductsPage() {
  const session = await getServerSession(authOptions)

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      <main className="flex-1 p-4 md:p-8 transition-all duration-300">
        <ProductTable products={products} />
      </main>
    </div>
  )
}