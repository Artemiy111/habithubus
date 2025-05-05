'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import HabitList from '@/components/habit-list'
import HabitGrid from '@/components/habit-grid'
import HabitStats from '@/components/habit-stats'
import Achievements from '@/components/achievements'
import ShareProgress from '@/components/share-progress'
import type { Habit, HabitCompletion } from '@/lib/types'
import confetti from 'canvas-confetti'

import { useThemeContext } from '@/lib/theme-context'
import { SettingsAppliedIndicator } from '@/components/settings-applied-indicator'
import {
  updateHabit as updateHabitAction,
  deleteHabit as deleteHabitAction,
  toggleCompletion as toggleCompletionAction,
  getUserHabits,
  getUserCompletions,
  getUserSettings,
  saveUserSettings,
  getUserAchievements,
} from '@/lib/db/actions'
import type { UserSettings } from '@/lib/types'

// Default settings
const defaultSettings: UserSettings = {
  theme: 'system',
  primaryColor: 'blue',
  enableNotifications: false,
  notificationTime: '20:00',
  showConfetti: true,
  shareProgress: false,
  reminderFrequency: 'daily',
}

interface HabitDashboardProps {
  userId: string
}

export default function HabitDashboard({ userId }: HabitDashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [showSettingsApplied, setShowSettingsApplied] = useState(false)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])

  const { setPrimaryColor } = useThemeContext()

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!isMounted) return

      setIsLoading(true)
      try {
        const userHabits = await getUserHabits(userId)
        if (isMounted) setHabits(userHabits)

        const userCompletions = await getUserCompletions(userId)
        if (isMounted) setCompletions(userCompletions)

        const userSettings = await getUserSettings(userId)
        if (userSettings && isMounted) {
          setSettings(userSettings)
          setPrimaryColor(userSettings.primaryColor as any)
        }

        const achievements = await getUserAchievements(userId)
        if (isMounted) setUnlockedAchievements(achievements)
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [userId, setPrimaryColor])

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      const habit = await updateHabitAction(updatedHabit)
      setHabits(habits.map((h) => (h.id === habit.id ? habit : h)))

      window.location.reload()
    } catch (error) {
      console.error('Ошибка при обновлении привычки:', error)
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      await deleteHabitAction(id)
      setHabits(habits.filter((h) => h.id !== id))
      setCompletions(completions.filter((c) => c.habitId !== id))
    } catch (error) {
      console.error('Ошибка при удалении привычки:', error)
    }
  }

  const toggleCompletion = async (habitId: string, date: string, isHarmfull: boolean) => {
    try {
      const existingCompletion = completions.find((c) => c.habitId === habitId && c.date === date)

      const updatedCompletion = await toggleCompletionAction(habitId, date, !existingCompletion)

      if (existingCompletion) {
        setCompletions(completions.filter((c) => !(c.habitId === habitId && c.date === date)))
      } else {
        setCompletions([...completions, updatedCompletion])

        if (settings.showConfetti && !isHarmfull) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса привычки:', error)
    }
  }

  const editHabit = (habit: Habit) => {
    // Создадим всплывающее окно для редактирования привычки
    // Это будет реализовано в компоненте HabitList
  }

  const handleSettingsChange = async (newSettings: UserSettings) => {
    try {
      if (newSettings.theme !== settings.theme) {
        document.documentElement.setAttribute('data-theme', newSettings.theme)
      }

      await saveUserSettings(userId, newSettings)
      setSettings(newSettings)
      setPrimaryColor(newSettings.primaryColor as any)
      setShowSettingsApplied(true)
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Ваши привычки</h2>
        <div className="flex items-center gap-2">
          <ShareProgress habits={habits} completions={completions} shareEnabled={settings.shareProgress} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grid">Сетка</TabsTrigger>
          <TabsTrigger value="list">Список</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <HabitGrid habits={habits} completions={completions} onToggleCompletion={toggleCompletion} />
        </TabsContent>
        <TabsContent value="list">
          <HabitList
            habits={habits}
            completions={completions}
            onToggleCompletion={toggleCompletion}
            onEdit={updateHabit}
            onDelete={deleteHabit}
          />
        </TabsContent>
        <TabsContent value="stats">
          <HabitStats habits={habits} completions={completions} />
        </TabsContent>
        <TabsContent value="achievements">
          <Achievements
            habits={habits}
            completions={completions}
            userId={userId}
            unlockedAchievements={unlockedAchievements}
          />
        </TabsContent>
      </Tabs>
      <SettingsAppliedIndicator show={showSettingsApplied} onHide={() => setShowSettingsApplied(false)} />
    </div>
  )
}
