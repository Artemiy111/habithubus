import type React from 'react'
export interface Habit {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  status: 'useful' | 'harmful' | 'neutral'
  createdAt: string
}

export interface HabitCompletion {
  habitId: string
  date: string
  completed: boolean
}

export interface User {
  id: string
  email: string
  name: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  primaryColor: string
  enableNotifications: boolean
  notificationTime: string
  showConfetti: boolean
  shareProgress: boolean
  reminderFrequency: 'daily' | 'weekly' | 'never'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  maxProgress: number
  unlocked: boolean
  points: number
}
