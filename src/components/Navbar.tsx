'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import UserDropdown from '../components/ui/UserDropdown'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
      
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-600">
        <Link href="/">MyWebsite</Link>
      </div>

      {/* Main Links */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-700 hover:text-blue-500">Home</Link>
        <Link href="/about" className="text-gray-700 hover:text-blue-500">About</Link>
        <Link href="/blog" className="text-gray-700 hover:text-blue-500">Blog</Link>
      </div>

      {/* Auth Section */}
      <div className="flex items-center gap-3">
        {status === 'loading' ? (
          <div className="text-sm text-gray-500 animate-pulse">Loading...</div>
        ) : session?.user ? (
          <UserDropdown />
        ) : (
          <>
            <UserCircleIcon className="h-6 w-6 text-gray-600" />
            <Link href="/register" className="text-sm text-blue-600 hover:underline">Register</Link>
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
          </>
        )}
      </div>
    </nav>
  )
}
