import { db } from "./index"
import { users, userSettings, habits, completions } from "./schema"
import { hashPassword } from "../auth/utils"

export async function seed() {
  console.log("🌱 Начало заполнения базы данных...")

  // Очистка существующих данных
  await db.delete(completions)
  await db.delete(habits)
  await db.delete(userSettings)
  await db.delete(users)

  console.log("✅ База данных очищена")

  // Создание тестового пользователя
  const hashedPassword = await hashPassword("password123")

  const [user] = await db
    .insert(users)
    .values({
      email: "test@example.com",
      name: "Тестовый Пользователь",
      password: hashedPassword,
    })
    .returning()

  console.log(`✅ Создан пользователь: ${user.email}`)

  // Создание настроек пользователя
  await db.insert(userSettings).values({
    userId: user.id,
    theme: "system",
    primaryColor: "blue",
    enableNotifications: false,
    notificationTime: "20:00",
    showConfetti: true,
    shareProgress: false,
    reminderFrequency: "daily",
  })

  console.log("✅ Созданы настройки пользователя")

  // Создание привычек
  const [habit1] = await db
    .insert(habits)
    .values({
      userId: user.id,
      name: "Утренняя зарядка",
      description: "15 минут упражнений каждое утро",
      frequency: "daily",
    })
    .returning()

  const [habit2] = await db
    .insert(habits)
    .values({
      userId: user.id,
      name: "Чтение книги",
      description: "Читать не менее 30 минут",
      frequency: "daily",
    })
    .returning()

  const [habit3] = await db
    .insert(habits)
    .values({
      userId: user.id,
      name: "Уборка дома",
      description: "Генеральная уборка",
      frequency: "weekly",
    })
    .returning()

  console.log("✅ Созданы привычки")

  // Создание выполнений
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  await db.insert(completions).values([
    { habitId: habit1.id, date: today, completed: true },
    { habitId: habit2.id, date: today, completed: true },
    { habitId: habit1.id, date: yesterday, completed: true },
  ])

  console.log("✅ Созданы выполнения привычек")
  console.log("🎉 База данных успешно заполнена!")
}

// Запуск заполнения базы данных, если скрипт запущен напрямую
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Ошибка при заполнении базы данных:", error)
      process.exit(1)
    })
}

