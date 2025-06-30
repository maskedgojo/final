import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RegisterForm />
    </div>
  )
}