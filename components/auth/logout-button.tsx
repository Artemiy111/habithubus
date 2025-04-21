'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await authClient.signOut()
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
