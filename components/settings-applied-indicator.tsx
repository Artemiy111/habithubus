"use client"

import { useEffect } from "react"
import { Check } from "lucide-react"

interface SettingsAppliedIndicatorProps {
  show: boolean
  onHide: () => void
}

export function SettingsAppliedIndicator({ show, onHide }: SettingsAppliedIndicatorProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out flex items-center gap-2">
      <Check className="h-4 w-4" />
      <span>Настройки успешно применены!</span>
    </div>
  )
}

