// app/admin/products/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import ProductTable from '@/components/ProductTable'

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Please sign in to view this page.</p>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  })

  const allowed = user?.userRoles.some(r =>
    ['Admin', 'InventoryManager'].includes(r.role.name)
  )

  if (!allowed) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-red-600">Access Denied</p>
      </div>
    )
  }

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
