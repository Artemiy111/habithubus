import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { getUserByEmail, getUserById, createUser, createUserSettings } from "@/lib/db/actions"
import type { NextResponse } from "next/server"

// Хеширование пароля
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  } catch (error) {
    console.error("Ошибка при хешировании пароля:", error)
    throw new Error("Не удалось обработать пароль. Пожалуйста, попробуйте позже.")
  }
}

// Проверка пароля
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Ошибка при проверке пароля:", error)
    throw new Error("Не удалось проверить пароль. Пожалуйста, попробуйте позже.")
  }
}

// Создание сессии
export async function createSession(userId: string, response?: NextResponse) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 неделя
    path: "/",
    sameSite: "lax" as const,
  }

  try {
    if (response) {
      // Для использования в API routes
      response.cookies.set("session", userId, cookieOptions)
      return response
    } else {
      // Для использования в Server Actions
      const cookieStore = await cookies()

      // Сначала удаляем существующую куку, если она есть
      cookieStore.delete("session")

      // Затем устанавливаем новую куку
      cookieStore.set("session", userId, cookieOptions)

      // Логируем для отладки
      console.log(`Session cookie set for user: ${userId}`)
    }
  } catch (error) {
    console.error("Ошибка при создании сессии:", error)
    throw new Error("Не удалось создать сессию. Пожалуйста, попробуйте позже.")
  }
}

// Получение текущего пользователя
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      console.log("No session cookie found")
      return null
    }

    console.log(`Session found: ${sessionId}`)
    const user = await getUserById(sessionId)

    if (!user) {
      console.log(`No user found for session: ${sessionId}`)
      return null
    }

    return user
  } catch (error) {
    console.error("Ошибка при получении текущего пользователя:", error)
    return null
  }
}

// Проверка аутентификации
export async function requireAuth() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      console.log("Authentication required, redirecting to login")
      redirect("/login")
    }

    return user
  } catch (error) {
    console.error("Ошибка при проверке аутентификации:", error)
    redirect("/login")
  }
}

// Выход из системы
export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
    console.log("Session cookie deleted")
    return "/login" // Возвращаем URL для редиректа вместо прямого вызова redirect()
  } catch (error) {
    console.error("Ошибка при выходе из системы:", error)
    throw new Error("Не удалось выйти из системы. Пожалуйста, попробуйте позже.")
  }
}

// Регистрация пользователя
export async function registerUser(email: string, name: string, password: string) {
  try {
    const hashedPassword = await hashPassword(password)

    // Проверяем, существует ли пользователь с таким email
    let existingUser = null
    try {
      existingUser = await getUserByEmail(email)
    } catch (error) {
      console.error("Ошибка при проверке существующего пользователя:", error)
      throw new Error("Не удалось проверить существование пользователя. Пожалуйста, попробуйте позже.")
    }

    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует")
    }

    // Создаем пользователя
    const user = await createUser({
      email,
      name,
      password: hashedPassword,
    })

    // Создаем настройки по умолчанию
    await createUserSettings(user.id)

    return user
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Не удалось зарегистрировать пользователя. Пожалуйста, попробуйте позже.")
  }
}

// Вход пользователя
export async function loginUser(email: string, password: string) {
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      throw new Error("Неверный email или пароль")
    }

    // Если пользователь зарегистрирован через GitHub (пустой пароль)
    if (!user.password) {
      throw new Error("Этот аккаунт использует вход через GitHub. Пожалуйста, используйте кнопку 'Войти через GitHub'.")
    }

    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw new Error("Неверный email или пароль")
    }

    await createSession(user.id)
    console.log(`User logged in: ${user.id}`)

    return user
  } catch (error) {
    console.error("Ошибка при входе пользователя:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Не удалось войти в систему. Пожалуйста, попробуйте позже.")
  }
}

