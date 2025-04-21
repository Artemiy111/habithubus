"use client"

import { useState } from "react"
import { Edit, Trash2, Check, X, ChevronDown, ChevronUp, Leaf, AlertTriangle, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import HabitForm from "@/components/habit-form"
import type { Habit, HabitCompletion } from "@/lib/types"
import { cn } from "@/lib/utils"

interface HabitListProps {
  habits: Habit[]
  completions: HabitCompletion[]
  onToggleCompletion: (habitId: string, date: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
}

// Добавим состояние для диалога редактирования
export default function HabitList({ habits, completions, onToggleCompletion, onEdit, onDelete }: HabitListProps) {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Check if a habit was completed today
  const isCompletedToday = (habitId: string) => {
    return completions.some((c) => c.habitId === habitId && c.date === today)
  }

  // Toggle habit completion for today
  const toggleTodayCompletion = (habitId: string) => {
    onToggleCompletion(habitId, today)
  }

  // Generate dates for the last 7 days
  const getLast7Days = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }

  const last7Days = getLast7Days()

  // Check if a habit was completed on a specific date
  const isCompletedOnDate = (habitId: string, date: string) => {
    return completions.some((c) => c.habitId === habitId && c.date === date)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", { weekday: "short", month: "short", day: "numeric" })
  }

  // Toggle expansion of a habit's details
  const toggleExpand = (habitId: string) => {
    if (expandedHabitId === habitId) {
      setExpandedHabitId(null)
    } else {
      setExpandedHabitId(habitId)
    }
  }

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "useful":
        return {
          icon: <Leaf className="h-4 w-4" />,
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        }
      case "harmful":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        }
      case "neutral":
      default:
        return {
          icon: <Minus className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        }
    }
  }

  // Обновим функцию для кнопки редактирования
  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (habit: Habit) => {
    onEdit(habit)
    setIsEditDialogOpen(false)
    setEditingHabit(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваши привычки</CardTitle>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Привычки еще не добавлены. Нажмите "Добавить привычку", чтобы начать.
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const statusInfo = getStatusInfo(habit.status)
              return (
                <Collapsible key={habit.id} open={expandedHabitId === habit.id} className="border rounded-lg">
                  <div className="flex items-center p-4">
                    <Button
                      variant={isCompletedToday(habit.id) ? "default" : "outline"}
                      size="icon"
                      className={cn("mr-3 h-8 w-8", isCompletedToday(habit.id) && "bg-green-600 hover:bg-green-700")}
                      onClick={() => toggleTodayCompletion(habit.id)}
                    >
                      {isCompletedToday(habit.id) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{habit.name}</h3>
                        <Badge variant="outline" className={cn("flex items-center gap-1", statusInfo.color)}>
                          {statusInfo.icon}
                          <span>
                            {habit.status === "useful"
                              ? "Полезная"
                              : habit.status === "harmful"
                                ? "Вредная"
                                : "Нейтральная"}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {habit.frequency === "daily"
                          ? "Ежедневно"
                          : habit.frequency === "weekly"
                            ? "Еженедельно"
                            : "Ежемесячно"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(habit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(habit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleExpand(habit.id)}>
                        {expandedHabitId === habit.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0">
                      {habit.description && <p className="text-sm mb-3">{habit.description}</p>}

                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-2">Последние 7 дней:</h4>
                        <div className="flex flex-wrap gap-2">
                          {last7Days.map((date) => {
                            const completed = isCompletedOnDate(habit.id, date)
                            return (
                              <button
                                key={date}
                                onClick={() => onToggleCompletion(habit.id, date)}
                                className={cn(
                                  "flex flex-col items-center justify-center rounded-md p-2 text-xs transition-colors",
                                  completed
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-muted hover:bg-muted/80",
                                )}
                              >
                                <span>{formatDate(date)}</span>
                                <span className="mt-1">
                                  {completed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}

        {/* Диалог редактирования привычки */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Редактировать привычку</DialogTitle>
              <DialogDescription>Измените детали вашей привычки.</DialogDescription>
            </DialogHeader>
            {editingHabit && (
              <HabitForm
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditDialogOpen(false)}
                initialData={editingHabit}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

