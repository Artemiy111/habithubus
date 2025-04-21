'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useToast } from '@/hooks/use-toast'

interface GitHubButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  isLoading?: boolean
}

export default function GitHubButton({ variant = 'outline', isLoading = false }: GitHubButtonProps) {
  const [loading, setLoading] = useState(isLoading)
const toast =  useToast()

  const handleGitHubLogin = async () => {
    setLoading(true)
    const result = await authClient.signIn.social({provider: 'github' })
    setLoading(false)
    if (result.error) {
      toast.toast({'title': 'Ошибка входа', 'description': result.error.statusText, 'variant': 'destructive'})
      return
    } 
    toast.toast({'title': 'Вход успешен', 'description': 'Вы успешно вошли', 'variant': 'default'})
  }

  return (
    <Button variant={variant} onClick={handleGitHubLogin} disabled={loading} className="w-full flex items-center gap-2">
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Github className="h-4 w-4" />
      )}
      {loading ? 'Перенаправление...' : 'Войти через GitHub'}
    </Button>
  )
}
