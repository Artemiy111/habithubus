import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import * as schema from "./schema"

// Получаем переменные окружения для подключения к Turso
const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error("TURSO_DATABASE_URL не указан в переменных окружения")
}

// Создаем клиент для Turso
const client = createClient({
  url,
  authToken,
})

// Инициализируем Drizzle ORM с нашим клиентом и схемой
export const db = drizzle(client, { schema })

// Экспортируем функцию для проверки соединения с базой данных
export async function checkDatabaseConnection() {
  try {
    // Простой запрос для проверки соединения
    const result = await client.execute("SELECT 1 as test")
    return true
  } catch (error) {
    console.error("Ошибка при подключении к базе данных:", error)
    return false
  }
}

