import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import {auth} from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function LogoutButton() {
  const handleLogout = async () => {
    'use server'
    try {
      await auth.api.signOut({headers: await headers()})
      await authClient.signOut()
      redirect('/login')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  return (
    <form action={handleLogout} >
      <Button variant="outline" className="w-full">
        Выйти
      </Button>
      </form>
  )
}
