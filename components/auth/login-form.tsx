"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { login } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import GitHubButton from "./github-button"

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Проверяем, пришел ли пользователь после успешной регистрации
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setSuccess("Регистрация успешна! Теперь вы можете войти.")
    }

    // Проверяем ошибки OAuth
    const error = searchParams.get("error")
    if (error) {
      switch (error) {
        case "github_auth_error":
          setError("Ошибка при авторизации через GitHub. Пожалуйста, попробуйте снова.")
          break
        case "invalid_state":
          setError("Недействительный запрос авторизации. Пожалуйста, попробуйте снова.")
          break
        case "no_code":
          setError("Не получен код авторизации от GitHub. Пожалуйста, попробуйте снова.")
          break
        case "token_error":
          setError("Ошибка при получении токена доступа. Пожалуйста, попробуйте снова.")
          break
        case "user_error":
          setError("Ошибка при получении данных пользователя. Пожалуйста, попробуйте снова.")
          break
        case "email_error":
          setError("Не удалось получить email пользователя. Пожалуйста, убедитесь, что ваш email в GitHub публичный.")
          break
        default:
          setError("Произошла ошибка при входе. Пожалуйста, попробуйте снова.")
      }
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await login(formData)

      if (result) {
        if (result.success && result.redirectUrl) {
          console.log("Login successful, redirecting to:", result.redirectUrl)
          router.push(result.redirectUrl)
          // Добавляем небольшую задержку перед перенаправлением
          setTimeout(() => {
            window.location.href = result.redirectUrl
          }, 100)
        } else if (!result.success) {
          setError(result.error)
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error during login:", error)
      setError("Произошла ошибка при входе. Пожалуйста, попробуйте снова.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Войдите в свой аккаунт</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

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
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

