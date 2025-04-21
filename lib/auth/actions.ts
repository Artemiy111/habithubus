'use server'

import { z } from 'zod'
import { registerUser, loginUser } from './utils'
import { cookies } from 'next/headers'

// Схема валидации для регистрации
const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

// Схема валидации для входа
const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

// Действие для регистрации
export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  try {
    const validatedData = registerSchema.parse({ email, name, password })
    await registerUser(validatedData.email, validatedData.name, validatedData.password)
    return { success: true, redirectUrl: '/login?registered=true' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Произошла ошибка при регистрации' }
  }
}

// Действие для входа
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const validatedData = loginSchema.parse({ email, password })
    await loginUser(validatedData.email, validatedData.password)
    return { success: true, redirectUrl: '/' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Произошла ошибка при входе' }
  }
}

// Действие для выхода
export async function logout() {
  try {
    ;(await cookies()).delete('session')
    return { success: true, redirectUrl: '/login' }
  } catch (error) {
    console.error('Ошибка при выходе:', error)
    return { success: false, error: 'Произошла ошибка при выходе' }
  }
}
