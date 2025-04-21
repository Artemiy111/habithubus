'use client'

import type React from 'react'

import { useState, useEffect, useCallback } from 'react'

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, action, variant }: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, action, variant }
    setToasts((toasts) => [...toasts, newToast])
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  // Automatically dismiss toasts after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) {
        setToasts((toasts) => toasts.slice(1))
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [toasts])

  return { toast, dismiss, toasts }
}
