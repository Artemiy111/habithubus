'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import GitHubButton from './github-button'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { useToast } from '@/hooks/use-toast'

const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)

  const toast = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    const _data = registerSchema.safeParse(Object.fromEntries(formData.entries()))
    if (_data.error) {
      toast.toast({ title: 'Ошибка регистрации', description: _data.error.errors[0].message, variant: 'destructive' })
      return
    }

    const result = await authClient.signUp.email({ ..._data.data, callbackURL: '/' })

    setIsLoading(false)
    if (result.error) {
      toast.toast({ title: 'Ошибка регистрации', description: result.error.statusText, variant: 'destructive' })
      return
    }
    toast.toast({ title: 'Регистрация успешена', description: 'Вы успешно вошли', variant: 'default' })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт для отслеживания привычек</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GitHubButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Или</span>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
