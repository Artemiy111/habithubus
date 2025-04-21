"use server"

import { db, checkDatabaseConnection } from "@/lib/db"
import { users, userSettings, habits, completions, userAchievements } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import type { Habit, HabitCompletion } from "@/lib/types"
import type { UserSettings } from "@/components/settings-dialog"
import { v4 as uuidv4 } from "uuid"

// Функция для проверки соединения с базой данных перед выполнением запросов
async function ensureDatabaseConnection() {
  try {
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      throw new Error("Не удалось подключиться к базе данных. Пожалуйста, проверьте настройки подключения.")
    }
  } catch (error) {
    console.error("Ошибка при проверке соединения с базой данных:", error)
    throw new Error("Проблема с подключением к базе данных. Пожалуйста, попробуйте позже.")
  }
}

// Функции для работы с пользователями
export async function getUserByEmail(email: string) {
  try {
    // Проверяем соединение с базой данных
    await ensureDatabaseConnection()

    // Используем прямой SQL-запрос вместо query builder для большей надежности
    const result = await db.select().from(users).where(eq(users.email, email))

    // Возвращаем первого найденного пользователя или null
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Ошибка при получении пользователя по email:", error)
    throw new Error("Не удалось получить пользователя. Пожалуйста, попробуйте позже.")
  }
}

export async function getUserById(id: string) {
  try {
    await ensureDatabaseConnection()

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    return user
  } catch (error) {
    console.error("Ошибка при получении пользователя по ID:", error)
    throw new Error("Не удалось получить пользователя. Пожалуйста, попробуйте позже.")
  }
}

export async function createUser(userData: { email: string; name: string; password: string; githubId?: string }) {
  try {
    await ensureDatabaseConnection()

    const [user] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        email: userData.email,
        name: userData.name,
        password: userData.password,
        githubId: userData.githubId,
      })
      .returning()

    return user
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error)
    throw new Error("Не удалось создать пользователя. Пожалуйста, попробуйте позже.")
  }
}

export async function createUserSettings(userId: string) {
  try {
    await ensureDatabaseConnection()

    await db.insert(userSettings).values({
      userId: userId,
      theme: "system",
      primaryColor: "blue",
      enableNotifications: false,
      notificationTime: "20:00",
      showConfetti: true,
      shareProgress: false,
      reminderFrequency: "daily",
    })
  } catch (error) {
    console.error("Ошибка при создании настроек пользователя:", error)
    throw new Error("Не удалось создать настройки пользователя. Пожалуйста, попробуйте позже.")
  }
}

// Получение привычек пользователя
export async function getUserHabits(userId: string): Promise<Habit[]> {
  try {
    await ensureDatabaseConnection()

    // Используем прямой запрос вместо query builder, если возникают проблемы
    const result = await db.select().from(habits).where(eq(habits.userId, userId))

    return result.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description || "",
      frequency: habit.frequency as "daily" | "weekly" | "monthly",
      status: habit.status as "useful" | "harmful" | "neutral",
      createdAt: habit.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Ошибка при получении привычек пользователя:", error)
    return []
  }
}

// Получение выполнений привычек пользователя
export async function getUserCompletions(userId: string): Promise<HabitCompletion[]> {
  try {
    await ensureDatabaseConnection()

    // Получаем все привычки пользователя
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId))

    // Получаем все выполнения для этих привычек
    const allCompletions: HabitCompletion[] = []

    for (const habit of userHabits) {
      const habitCompletions = await db.select().from(completions).where(eq(completions.habitId, habit.id))

      habitCompletions.forEach((completion) => {
        allCompletions.push({
          habitId: completion.habitId,
          date: completion.date,
          completed: completion.completed,
        })
      })
    }

    return allCompletions
  } catch (error) {
    console.error("Ошибка при получении выполнений привычек:", error)
    return []
  }
}

// Получение настроек пользователя
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    await ensureDatabaseConnection()

    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    })

    if (!settings) return null

    return {
      theme: settings.theme as "light" | "dark" | "system",
      primaryColor: settings.primaryColor,
      enableNotifications: settings.enableNotifications,
      notificationTime: settings.notificationTime,
      showConfetti: settings.showConfetti,
      shareProgress: settings.shareProgress,
      reminderFrequency: settings.reminderFrequency as "daily" | "weekly" | "never",
    }
  } catch (error) {
    console.error("Ошибка при получении настроек пользователя:", error)
    return null
  }
}

// Сохранение привычки
export async function saveHabit(habit: Omit<Habit, "id" | "createdAt"> & { userId: string }): Promise<Habit> {
  try {
    await ensureDatabaseConnection()

    const [newHabit] = await db
      .insert(habits)
      .values({
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        status: habit.status,
        userId: habit.userId,
      })
      .returning()

    return {
      id: newHabit.id,
      name: newHabit.name,
      description: newHabit.description || "",
      frequency: newHabit.frequency as "daily" | "weekly" | "monthly",
      status: newHabit.status as "useful" | "harmful" | "neutral",
      createdAt: newHabit.createdAt.toISOString(),
    }
  } catch (error) {
    console.error("Ошибка при сохранении привычки:", error)
    throw new Error("Не удалось сохранить привычку. Пожалуйста, попробуйте позже.")
  }
}

// Обновление привычки
export async function updateHabit(habit: Habit): Promise<Habit> {
  try {
    await ensureDatabaseConnection()

    const [updatedHabit] = await db
      .update(habits)
      .set({
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        status: habit.status,
      })
      .where(eq(habits.id, habit.id))
      .returning()

    return {
      id: updatedHabit.id,
      name: updatedHabit.name,
      description: updatedHabit.description || "",
      frequency: updatedHabit.frequency as "daily" | "weekly" | "monthly",
      status: updatedHabit.status as "useful" | "harmful" | "neutral",
      createdAt: updatedHabit.createdAt.toISOString(),
    }
  } catch (error) {
    console.error("Ошибка при обновлении привычки:", error)
    throw new Error("Не удалось обновить привычку. Пожалуйста, попробуйте позже.")
  }
}

// Удаление привычки
export async function deleteHabit(habitId: string): Promise<void> {
  try {
    await ensureDatabaseConnection()
    await db.delete(habits).where(eq(habits.id, habitId))
  } catch (error) {
    console.error("Ошибка при удалении привычки:", error)
    throw new Error("Не удалось удалить привычку. Пожалуйста, попробуйте позже.")
  }
}

// Переключение статуса выполнения привычки
export async function toggleCompletion(habitId: string, date: string, completed: boolean): Promise<HabitCompletion> {
  try {
    await ensureDatabaseConnection()

    const existingCompletion = await db.query.completions.findFirst({
      where: and(eq(completions.habitId, habitId), eq(completions.date, date)),
    })

    if (existingCompletion) {
      await db.delete(completions).where(and(eq(completions.habitId, habitId), eq(completions.date, date)))
    } else {
      await db.insert(completions).values({
        habitId,
        date,
        completed: true,
      })
    }

    return {
      habitId,
      date,
      completed: true,
    }
  } catch (error) {
    console.error("Ошибка при переключении статуса выполнения привычки:", error)
    throw new Error("Не удалось переключить статус выполнения привычки. Пожалуйста, попробуйте позже.")
  }
}

// Сохранение настроек пользователя
export async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  try {
    await ensureDatabaseConnection()

    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    })

    if (existingSettings) {
      await db
        .update(userSettings)
        .set({
          theme: settings.theme,
          primaryColor: settings.primaryColor,
          enableNotifications: settings.enableNotifications,
          notificationTime: settings.notificationTime,
          showConfetti: settings.showConfetti,
          shareProgress: settings.shareProgress,
          reminderFrequency: settings.reminderFrequency,
        })
        .where(eq(userSettings.userId, userId))
    } else {
      await db.insert(userSettings).values({
        userId,
        theme: settings.theme,
        primaryColor: settings.primaryColor,
        enableNotifications: settings.enableNotifications,
        notificationTime: settings.notificationTime,
        showConfetti: settings.showConfetti,
        shareProgress: settings.shareProgress,
        reminderFrequency: settings.reminderFrequency,
      })
    }
  } catch (error) {
    console.error("Ошибка при сохранении настроек пользователя:", error)
    throw new Error("Не удалось сохранить настройки пользователя. Пожалуйста, попробуйте позже.")
  }
}

// Получение достижений пользователя
export async function getUserAchievements(userId: string): Promise<string[]> {
  try {
    await ensureDatabaseConnection()

    const achievements = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))

    return achievements.map((a) => a.achievementId)
  } catch (error) {
    console.error("Ошибка при получении достижений пользователя:", error)
    return []
  }
}

// Сохранение достижения пользователя
export async function saveUserAchievement(userId: string, achievementId: string): Promise<boolean> {
  try {
    await ensureDatabaseConnection()

    // Проверяем, есть ли уже такое достижение у пользователя
    const existingAchievement = await db.query.userAchievements.findFirst({
      where: and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)),
    })

    // Если достижение уже есть, не добавляем его повторно
    if (existingAchievement) {
      return false
    }

    // Добавляем новое достижение
    await db.insert(userAchievements).values({
      userId,
      achievementId,
    })

    return true
  } catch (error) {
    console.error("Ошибка при сохранении достижения пользователя:", error)
    return false
  }
}

