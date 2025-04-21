'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Leaf, AlertTriangle, Minus } from 'lucide-react'
import type { Habit } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HabitFormProps {
  onSubmit: (habit: Habit) => void
  onCancel: () => void
  initialData?: Habit | null
}

export default function HabitForm({ onSubmit, onCancel, initialData }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(initialData?.frequency || 'daily')
  const [status, setStatus] = useState<'useful' | 'harmful' | 'neutral'>(initialData?.status || 'useful')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
      setFrequency(initialData.frequency)
      setStatus(initialData.status || 'useful')
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const habit: Habit = {
      id: initialData?.id || '',
      name,
      description,
      frequency,
      status,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    }

    onSubmit(habit)
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Habit' : 'Add New Habit'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Exercise"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your habit..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <RadioGroup
              value={frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFrequency(value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              value={status}
              onValueChange={(value: 'useful' | 'harmful' | 'neutral') => setStatus(value)}
              className="grid grid-cols-3 gap-2"
            >
              <div
                className={cn(
                  'flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer transition-colors',
                  status === 'useful' ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : 'hover:bg-muted/50',
                )}
              >
                <RadioGroupItem value="useful" id="useful" className="sr-only" />
                <Label htmlFor="useful" className="cursor-pointer flex flex-col items-center gap-1">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <span>Полезная</span>
                </Label>
              </div>
              <div
                className={cn(
                  'flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer transition-colors',
                  status === 'harmful' ? 'bg-red-100 dark:bg-red-900/30 border-red-500' : 'hover:bg-muted/50',
                )}
              >
                <RadioGroupItem value="harmful" id="harmful" className="sr-only" />
                <Label htmlFor="harmful" className="cursor-pointer flex flex-col items-center gap-1">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Вредная</span>
                </Label>
              </div>
              <div
                className={cn(
                  'flex flex-col items-center space-y-2 border rounded-md p-3 cursor-pointer transition-colors',
                  status === 'neutral' ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-500' : 'hover:bg-muted/50',
                )}
              >
                <RadioGroupItem value="neutral" id="neutral" className="sr-only" />
                <Label htmlFor="neutral" className="cursor-pointer flex flex-col items-center gap-1">
                  <Minus className="h-5 w-5 text-gray-500" />
                  <span>Нейтральная</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{initialData ? 'Update Habit' : 'Add Habit'}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
