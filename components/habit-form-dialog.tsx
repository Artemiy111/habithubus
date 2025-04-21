"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import HabitForm from "@/components/habit-form"
import { saveHabit } from "@/lib/db/actions"
import type { Habit } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface HabitFormDialogProps {
  userId: string
}

export default function HabitFormDialog({ userId }: HabitFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (habit: Habit) => {
    try {
      setIsSubmitting(true)
      await saveHabit({
        ...habit,
        userId,
      })

      setIsOpen(false)
      setIsSubmitting(false)

      toast({
        title: "Привычка добавлена",
        description: "Ваша новая привычка была успешно добавлена.",
      })

      // Используем window.location.href вместо reload для предотвращения ошибки гидрации
      window.location.href = window.location.pathname
    } catch (error) {
      console.error("Ошибка при добавлении привычки:", error)
      setIsSubmitting(false)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить привычку. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить привычку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить новую привычку</DialogTitle>
          <DialogDescription>Создайте новую привычку для отслеживания. Заполните форму ниже.</DialogDescription>
        </DialogHeader>
        {isSubmitting ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3">Сохранение...</span>
          </div>
        ) : (
          <HabitForm onSubmit={handleSubmit} onCancel={() => setIsOpen(false)} initialData={null} />
        )}
      </DialogContent>
    </Dialog>
  )
}

