'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import GitHubButton from './github-button'
import { authClient } from '@/lib/auth-client'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
})

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{form?:string, email? :string, password?:string}>({})
  const router = useRouter()
  const {toast} = useToast()

  async function handleSubmit(formData: FormData) {
    
    const _data = loginSchema.safeParse(Object.fromEntries(formData.entries()))
    if (_data.error) {
      const {email, password} = _data.error.formErrors.fieldErrors
      setErrors({
        email: email ? email.join(', ') : undefined,
        password: password ? password.join(', ') : undefined,
      })
      return
    }
    setIsLoading(true)

    const result = await authClient.signIn.email({ ..._data.data })
    
    setIsLoading(false)

    if (result.error) {
      setErrors({form: 'Ошибка входа'})
      toast({ title: 'Ошибка входа', description: result.error.statusText, variant: 'destructive' })
      return
    }
    toast({ title: 'Вход успешен', description: 'Вы успешно вошли', variant: 'default' })
    router.push('/')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Войдите в свой аккаунт</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GitHubButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <p className="bg-background px-2 text-muted-foreground">Или</p>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
            {errors.email &&  <p className='text-destructive' >{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required />
            {errors.password &&  <p className='text-destructive' >{errors.password}</p>}
          </div>

          {errors.form &&  <p className='text-destructive' >{errors.form}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
