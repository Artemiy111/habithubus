'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Leaf, AlertTriangle, Minus, Grid, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Habit, HabitCompletion } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HabitGridProps {
  habits: Habit[]
  completions: HabitCompletion[]
  onToggleCompletion: (habitId: string, date: string, isHarmfull: boolean) => void
}

export default function HabitGrid({ habits, completions, onToggleCompletion }: HabitGridProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(habits.length > 0 ? habits[0].id : null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')

  // Generate dates for the grid (similar to GitHub contribution grid)
  const generateDates = () => {
    const dates = []
    const startDate = new Date(currentDate)

    // Set to the first day of the month
    startDate.setDate(1)

    // Get the number of days in the current month
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()

    // Generate array of dates for the month
    for (let i = 0; i < daysInMonth; i++) {
      const date = new Date(startDate)
      date.setDate(i + 1)
      dates.push(date)
    }

    return dates
  }

  const dates = generateDates()

  // Format date as YYYY-MM-DD for comparison with completions
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Check if a habit was completed on a specific date
  const isCompleted = (habitId: string, date: Date) => {
    const dateString = formatDateString(date)
    return completions.some((c) => c.habitId === habitId && c.date === dateString)
  }

  // Get the selected habit
  const selectedHabit = habits.find((h) => h.id === selectedHabitId)

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Get month name and year
  const monthYear = currentDate.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  // Handle cell click to toggle completion
  const handleCellClick = (date: Date) => {
    if (!selectedHabitId) return
    const habit = habits.find((h) => h.id === selectedHabitId)
    if (!habit) return
    onToggleCompletion(selectedHabitId, formatDateString(date), habit.status === 'harmful')
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'useful':
        return <Leaf className="h-4 w-4 text-green-500" />
      case 'harmful':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'neutral':
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Get completion color based on habit status
  const getCompletionColor = (habit: Habit, completed: boolean) => {
    if (!completed) return 'bg-muted hover:bg-muted/80'

    switch (habit.status) {
      case 'useful':
        return 'bg-green-600 text-white hover:bg-green-700'
      case 'harmful':
        return 'bg-red-600 text-white hover:bg-red-700'
      case 'neutral':
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700'
    }
  }

  // Generate calendar data for the calendar view
  const generateCalendarData = () => {
    // Get the first day of the month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    // Get the last day of the month
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay()
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    // Calculate how many days from the previous month we need to show
    const daysFromPrevMonth = firstDayOfWeek

    // Calculate the start date (might be in the previous month)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - daysFromPrevMonth)

    // We'll show 6 weeks (42 days) to ensure we have enough space
    const calendarDays = []

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      // Check if this date is in the current month
      const isCurrentMonth = currentDate.getMonth() === firstDay.getMonth()

      calendarDays.push({
        date: currentDate,
        isCurrentMonth,
      })
    }

    // Group into weeks
    const weeks = []
    for (let i = 0; i < 6; i++) {
      weeks.push(calendarDays.slice(i * 7, (i + 1) * 7))
    }

    return weeks
  }

  const calendarWeeks = generateCalendarData()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Сетка привычек</CardTitle>
            <div className="ml-4">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'calendar')}>
                <TabsList>
                  <TabsTrigger value="grid" className="flex items-center gap-1">
                    <Grid className="h-4 w-4" />
                    <span>Сетка</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-1">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Календарь</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {monthYear}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedHabitId || ''} onValueChange={(value) => setSelectedHabitId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите привычку для просмотра" />
            </SelectTrigger>
            <SelectContent>
              {habits.map((habit) => (
                <SelectItem key={habit.id} value={habit.id}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(habit.status)}
                    <span>{habit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedHabit ? (
          <>
            <div className="text-sm mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedHabit.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'flex items-center gap-1',
                    selectedHabit.status === 'useful'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : selectedHabit.status === 'harmful'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                  )}
                >
                  {getStatusIcon(selectedHabit.status)}
                  <span>
                    {selectedHabit.status === 'useful'
                      ? 'Полезная'
                      : selectedHabit.status === 'harmful'
                        ? 'Вредная'
                        : 'Нейтральная'}
                  </span>
                </Badge>
              </div>
              {selectedHabit.description && <p className="text-muted-foreground mt-1">{selectedHabit.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Частота:{' '}
                {selectedHabit.frequency === 'daily'
                  ? 'Ежедневно'
                  : selectedHabit.frequency === 'weekly'
                    ? 'Еженедельно'
                    : 'Ежемесячно'}
              </p>
            </div>

            {viewMode === 'grid' ? (
              // Grid View (Original)
              <div className="grid grid-cols-7 gap-1 mt-4">
                {/* Day labels */}
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                  <div key={day} className="text-xs text-center font-medium">
                    {day}
                  </div>
                ))}

                {/* Empty cells for alignment */}
                {Array.from({
                  length: new Date(dates[0].getFullYear(), dates[0].getMonth(), 1).getDay() || 7,
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 rounded-md"></div>
                ))}

                {/* Date cells */}
                {dates.map((date) => {
                  const completed = selectedHabitId ? isCompleted(selectedHabitId, date) : false
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleCellClick(date)}
                      className={cn(
                        'h-8 rounded-md flex items-center justify-center text-xs transition-colors',
                        getCompletionColor(selectedHabit, completed),
                      )}
                      title={`${date.toLocaleDateString()} - ${completed ? 'Выполнено' : 'Не выполнено'}`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            ) : (
              // Calendar View (New)
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 bg-muted">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="text-xs text-center font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="divide-y">
                  {calendarWeeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="grid grid-cols-7 divide-x">
                      {week.map((day, dayIndex) => {
                        const completed = selectedHabitId ? isCompleted(selectedHabitId, day.date) : false
                        return (
                          <button
                            key={`day-${weekIndex}-${dayIndex}`}
                            onClick={() => handleCellClick(day.date)}
                            className={cn(
                              'h-16 p-1 flex flex-col items-start justify-start transition-colors relative',
                              !day.isCurrentMonth && 'opacity-40 bg-muted/30',
                              day.isCurrentMonth && completed && getCompletionColor(selectedHabit, completed),
                            )}
                            title={`${day.date.toLocaleDateString()} - ${completed ? 'Выполнено' : 'Не выполнено'}`}
                          >
                            <span
                              className={cn(
                                'text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center',
                                day.isCurrentMonth && completed ? 'text-white' : 'text-foreground',
                              )}
                            >
                              {day.date.getDate()}
                            </span>

                            {day.isCurrentMonth && completed && (
                              <div className="absolute bottom-1 right-1">{getStatusIcon(selectedHabit.status)}</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-sm bg-muted mr-1"></div>
                <span>Не выполнено</span>
              </div>
              <div className="flex items-center">
                <div
                  className={cn(
                    'w-3 h-3 rounded-sm mr-1',
                    selectedHabit.status === 'useful'
                      ? 'bg-green-600'
                      : selectedHabit.status === 'harmful'
                        ? 'bg-red-600'
                        : 'bg-gray-600',
                  )}
                ></div>
                <span>Выполнено</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {habits.length === 0 ? 'Добавьте привычку, чтобы начать' : 'Выберите привычку для просмотра'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
