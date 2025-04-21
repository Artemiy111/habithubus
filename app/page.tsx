import { redirect } from 'next/navigation'
import HabitDashboard from '@/components/habit-dashboard'
import LogoutButton from '@/components/auth/logout-button'
import SettingsDialog from '@/components/settings-dialog'
import HabitFormDialog from '@/components/habit-form-dialog'
import { getUserSettings, saveUserSettings } from '@/lib/db/actions'
import type { UserSettings } from '@/lib/types'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    redirect('/login')
  }
  const { user } = session

  const userSettings = (await getUserSettings(user.id)) || {
    theme: 'system',
    primaryColor: 'blue',
    enableNotifications: false,
    notificationTime: '20:00',
    showConfetti: true,
    shareProgress: false,
    reminderFrequency: 'daily',
  }

  async function handleSettingsChange(settings: UserSettings) {
    'use server'
    if (user) {
      await saveUserSettings(user.id, settings)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text mr-2">
            HabitHubus
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <HabitFormDialog userId={user.id} />
          <SettingsDialog settings={userSettings} onSettingsChange={handleSettingsChange} />
          <LogoutButton />
        </div>
      </div>
      <HabitDashboard userId={user.id} />
    </main>
  )
}
