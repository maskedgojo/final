import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { UsersProvider } from '@/context/users-context' // ✅ Import UsersProvider
import UserTable from '@/components/UserTable'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex-1 p-4 md:p-8 transition-all duration-300">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome {session.user?.name ?? session.user?.email}
          </h1>
          <p className="text-gray-600 mt-1">User Management Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
            <Link
              href="/admin/roles"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Manage Roles
            </Link>
          </div>

          {/* ✅ Wrap table with UsersProvider */}
          <UsersProvider>
            <UserTable />
          </UsersProvider>
        </div>
      </main>
    </div>
  )
}
