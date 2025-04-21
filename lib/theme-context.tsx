'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

type ThemeColor = 'blue' | 'green' | 'purple' | 'red' | 'orange'

interface ThemeContextType {
  primaryColor: ThemeColor
  setPrimaryColor: (color: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>('blue')
  const { theme, setTheme } = useNextTheme()

  // Load saved color from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.primaryColor) {
        setPrimaryColor(settings.primaryColor)
      }
      if (settings.theme) {
        setTheme(settings.theme)
      }
    }
  }, [setTheme])

  // Apply the color theme to the document
  useEffect(() => {
    // Remove any existing color classes
    document.documentElement.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange')

    // Add the selected color class
    document.documentElement.classList.add(`theme-${primaryColor}`)

    // Define color mappings with high contrast values
    const colorMappings = {
      blue: {
        light: {
          primary: '221.2 83.2% 53.3%',
          primaryForeground: '210 40% 98%',
        },
        dark: {
          primary: '217.2 91.2% 59.8%',
          primaryForeground: '222.2 47.4% 11.2%',
        },
      },
      green: {
        light: {
          primary: '142.1 76.2% 36.3%',
          primaryForeground: '355.7 100% 97.3%',
        },
        dark: {
          primary: '142.1 70.6% 45.3%',
          primaryForeground: '144.9 80.4% 10%',
        },
      },
      purple: {
        light: {
          primary: '262.1 83.3% 57.8%',
          primaryForeground: '210 40% 98%',
        },
        dark: {
          primary: '263.4 70% 50.4%',
          primaryForeground: '210 40% 98%',
        },
      },
      red: {
        light: {
          primary: '346.8 77.2% 49.8%',
          primaryForeground: '355.7 100% 97.3%',
        },
        dark: {
          primary: '346.8 77.2% 49.8%',
          primaryForeground: '355.7 100% 97.3%',
        },
      },
      orange: {
        light: {
          primary: '24.6 95% 53.1%',
          primaryForeground: '355.7 100% 97.3%',
        },
        dark: {
          primary: '20.5 90.2% 48.2%',
          primaryForeground: '355.7 100% 97.3%',
        },
      },
    }

    // Set CSS variables based on current theme
    const root = document.documentElement
    const currentTheme = theme === 'dark' ? 'dark' : 'light'
    const colors = colorMappings[primaryColor][currentTheme]

    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--ring', colors.primary) // Также обновляем переменную ring

    // Принудительно обновляем атрибут data-theme для немедленного применения темы
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [primaryColor, theme])

  return <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
