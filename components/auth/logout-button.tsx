'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth/actions'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const redirectUrl = await logout()
      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading} className="w-full">
      {isLoading ? 'Выход...' : 'Выйти'}
    </Button>
  )
}
