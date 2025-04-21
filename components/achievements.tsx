'use client'

import type React from 'react'

import { useMemo, useEffect, useState } from 'react'
import { Award, Star, Trophy, Zap, Target, Flame, Leaf, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Habit, HabitCompletion } from '@/lib/types'
import { cn } from '@/lib/utils'
import { saveUserAchievement } from '@/lib/db/actions'

interface AchievementsProps {
  habits: Habit[]
  completions: HabitCompletion[]
  userId: string
  unlockedAchievements: string[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  maxProgress: number
  unlocked: boolean
  points: number
}

export default function Achievements({ habits, completions, userId, unlockedAchievements }: AchievementsProps) {
  const [savedAchievements, setSavedAchievements] = useState<string[]>(unlockedAchievements || [])

  const achievements = useMemo<Achievement[]>(() => {
    // Calculate total completions
    const totalCompletions = completions.length

    // Calculate streak (consecutive days with at least one completion)
    const streakDays = calculateStreak(completions)

    // Calculate total habits created
    const totalHabits = habits.length

    // Calculate perfect days (days where all daily habits were completed)
    const perfectDays = calculatePerfectDays(habits, completions)

    // Calculate useful habits
    const usefulHabits = habits.filter((h) => h.status === 'useful').length

    // Calculate harmful habits being tracked
    const harmfulHabits = habits.filter((h) => h.status === 'harmful').length

    // Calculate harmful habit completions
    const harmfulCompletions = completions.filter((c) => {
      const habit = habits.find((h) => h.id === c.habitId)
      return habit && habit.status === 'harmful'
    }).length

    return [
      {
        id: 'first-habit',
        title: 'Первый шаг',
        description: 'Создайте свою первую привычку',
        icon: <Zap className="h-6 w-6 text-yellow-500" />,
        progress: Math.min(totalHabits, 1),
        maxProgress: 1,
        unlocked: savedAchievements.includes('first-habit') || totalHabits >= 1,
        points: 10,
      },
      {
        id: 'habit-collector',
        title: 'Коллекционер привычек',
        description: 'Создайте 5 привычек',
        icon: <Star className="h-6 w-6 text-purple-500" />,
        progress: Math.min(totalHabits, 5),
        maxProgress: 5,
        unlocked: savedAchievements.includes('habit-collector') || totalHabits >= 5,
        points: 25,
      },
      {
        id: 'completion-beginner',
        title: 'Начинающий',
        description: 'Выполните 10 привычек',
        icon: <Award className="h-6 w-6 text-blue-500" />,
        progress: Math.min(totalCompletions, 10),
        maxProgress: 10,
        unlocked: savedAchievements.includes('completion-beginner') || totalCompletions >= 10,
        points: 15,
      },
      {
        id: 'completion-master',
        title: 'Мастер выполнения',
        description: 'Выполните 50 привычек',
        icon: <Trophy className="h-6 w-6 text-amber-500" />,
        progress: Math.min(totalCompletions, 50),
        maxProgress: 50,
        unlocked: savedAchievements.includes('completion-master') || totalCompletions >= 50,
        points: 50,
      },
      {
        id: 'streak-starter',
        title: 'Начало серии',
        description: 'Поддерживайте серию из 3 дней',
        icon: <Flame className="h-6 w-6 text-orange-500" />,
        progress: Math.min(streakDays, 3),
        maxProgress: 3,
        unlocked: savedAchievements.includes('streak-starter') || streakDays >= 3,
        points: 20,
      },
      {
        id: 'streak-warrior',
        title: 'Воин серии',
        description: 'Поддерживайте серию из 7 дней',
        icon: <Flame className="h-6 w-6 text-red-500" />,
        progress: Math.min(streakDays, 7),
        maxProgress: 7,
        unlocked: savedAchievements.includes('streak-warrior') || streakDays >= 7,
        points: 40,
      },
      {
        id: 'perfect-day',
        title: 'Идеальный день',
        description: 'Выполните все ежедневные привычки за день',
        icon: <Target className="h-6 w-6 text-green-500" />,
        progress: Math.min(perfectDays, 1),
        maxProgress: 1,
        unlocked: savedAchievements.includes('perfect-day') || perfectDays >= 1,
        points: 30,
      },
      {
        id: 'useful-habits',
        title: 'Полезные привычки',
        description: 'Создайте 3 полезные привычки',
        icon: <Leaf className="h-6 w-6 text-green-500" />,
        progress: Math.min(usefulHabits, 3),
        maxProgress: 3,
        unlocked: savedAchievements.includes('useful-habits') || usefulHabits >= 3,
        points: 25,
      },
      {
        id: 'harmful-awareness',
        title: 'Осознанность',
        description: 'Отслеживайте 2 вредные привычки',
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
        progress: Math.min(harmfulHabits, 2),
        maxProgress: 2,
        unlocked: savedAchievements.includes('harmful-awareness') || harmfulHabits >= 2,
        points: 20,
      },
      {
        id: 'breaking-bad',
        title: 'Ломая плохое',
        description: 'Отметьте вредную привычку 10 раз',
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
        progress: Math.min(harmfulCompletions, 10),
        maxProgress: 10,
        unlocked: savedAchievements.includes('breaking-bad') || harmfulCompletions >= 10,
        points: 15,
      },
    ]
  }, [habits, completions, savedAchievements])

  // Сохраняем новые достижения в базу данных
  useEffect(() => {
    const saveNewAchievements = async () => {
      for (const achievement of achievements) {
        if (achievement.unlocked && !savedAchievements.includes(achievement.id)) {
          const saved = await saveUserAchievement(userId, achievement.id)
          if (saved) {
            setSavedAchievements((prev) => [...prev, achievement.id])
          }
        }
      }
    }

    saveNewAchievements()
  }, [achievements, userId, savedAchievements])

  // Calculate total points earned
  const totalPoints = useMemo(() => {
    return achievements
      .filter((achievement) => achievement.unlocked)
      .reduce((total, achievement) => total + achievement.points, 0)
  }, [achievements])

  // Calculate user level based on points
  const userLevel = useMemo(() => {
    return Math.floor(totalPoints / 50) + 1
  }, [totalPoints])

  // Calculate progress to next level
  const nextLevelProgress = useMemo(() => {
    const pointsToNextLevel = userLevel * 50
    const progress = ((totalPoints % 50) / 50) * 100
    return {
      current: totalPoints,
      next: pointsToNextLevel,
      progress,
    }
  }, [totalPoints, userLevel])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ваши достижения</CardTitle>
          <CardDescription>Отслеживайте свой прогресс и получайте награды</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold">Уровень {userLevel}</h3>
                <p className="text-sm text-muted-foreground">
                  {nextLevelProgress.current} / {nextLevelProgress.next} очков до Уровня {userLevel + 1}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={nextLevelProgress.progress} className="h-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  'border rounded-lg p-4 transition-all',
                  achievement.unlocked ? 'bg-primary/10 border-primary/20' : 'bg-muted/50 border-border',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('rounded-full p-2', achievement.unlocked ? 'bg-primary/20' : 'bg-muted')}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <span className="text-sm font-medium">{achievement.points} очк.</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Прогресс</span>
                        <span>
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to calculate streak
function calculateStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0

  // Get all unique dates with completions
  const completionDates = [...new Set(completions.map((c) => c.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )

  if (completionDates.length === 0) return 0

  // Check if the most recent completion is today or yesterday
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const mostRecentDate = new Date(completionDates[0])
  mostRecentDate.setHours(0, 0, 0, 0)

  if (mostRecentDate.getTime() !== today.getTime() && mostRecentDate.getTime() !== yesterday.getTime()) {
    return 0
  }

  // Count consecutive days
  let streak = 1
  for (let i = 1; i < completionDates.length; i++) {
    const currentDate = new Date(completionDates[i - 1])
    const prevDate = new Date(completionDates[i])

    // Calculate difference in days
    const diffTime = currentDate.getTime() - prevDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Helper function to calculate perfect days
function calculatePerfectDays(habits: Habit[], completions: HabitCompletion[]): number {
  if (habits.length === 0) return 0

  // Get daily habits
  const dailyHabits = habits.filter((h) => h.frequency === 'daily')
  if (dailyHabits.length === 0) return 0

  // Get all unique dates with completions
  const completionDates = [...new Set(completions.map((c) => c.date))]

  // Count perfect days
  let perfectDays = 0

  completionDates.forEach((date) => {
    const dateCompletions = completions.filter((c) => c.date === date)
    const completedHabitIds = dateCompletions.map((c) => c.habitId)

    // Check if all daily habits were completed on this date
    const allDailyHabitsCompleted = dailyHabits.every((habit) => completedHabitIds.includes(habit.id))

    if (allDailyHabitsCompleted) {
      perfectDays++
    }
  })

  return perfectDays
}
