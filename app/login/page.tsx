import { Suspense } from 'react'
import LoginForm from '@/components/auth/login-form'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  console.log('sees', session)

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">HabitHubus</h1>
        <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Загрузка...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
