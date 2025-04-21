"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Check, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { useThemeContext } from "@/lib/theme-context"

interface SettingsDialogProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  primaryColor: string
  enableNotifications: boolean
  notificationTime: string
  showConfetti: boolean
  shareProgress: boolean
  reminderFrequency: "daily" | "weekly" | "never"
}

export default function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const { primaryColor, setPrimaryColor } = useThemeContext()

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  // Apply theme changes immediately
  useEffect(() => {
    setTheme(localSettings.theme)
    setPrimaryColor(localSettings.primaryColor as any)
  }, [localSettings.theme, localSettings.primaryColor, setTheme, setPrimaryColor])

  // Update the handleSave function to show a confirmation
  const handleSave = () => {
    // Немедленно применяем тему
    setTheme(localSettings.theme)
    // Сохраняем настройки
    onSettingsChange(localSettings)
    // Закрываем диалог
    setIsOpen(false)
    // Показываем уведомление
    toast({
      title: "Настройки сохранены",
      description: "Ваши предпочтения были обновлены.",
    })
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const colorOptions = [
    { value: "blue", label: "Синий", color: "hsl(221.2, 83.2%, 53.3%)" },
    { value: "green", label: "Зеленый", color: "hsl(142.1, 76.2%, 36.3%)" },
    { value: "purple", label: "Фиолетовый", color: "hsl(262.1, 83.3%, 57.8%)" },
    { value: "red", label: "Красный", color: "hsl(346.8, 77.2%, 49.8%)" },
    { value: "orange", label: "Оранжевый", color: "hsl(24.6, 95%, 53.1%)" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Настройки">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>Настройте приложение для отслеживания привычек</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="sharing">Общий доступ</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Тема</Label>
                <RadioGroup
                  value={localSettings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => updateSetting("theme", value)}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center">
                      <Sun className="mr-1 h-4 w-4" /> Светлая
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center">
                      <Moon className="mr-1 h-4 w-4" /> Темная
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">Системная</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Основной цвет</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateSetting("primaryColor", color.value)}
                      className={`h-12 w-full rounded-md transition-all flex items-center justify-center ${
                        localSettings.primaryColor === color.value
                          ? "ring-2 ring-offset-2 ring-offset-background"
                          : "hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: color.color,
                        color: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                      aria-label={`Установить цвет ${color.label}`}
                    >
                      {localSettings.primaryColor === color.value ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <span className="text-xs font-medium">{color.label}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-confetti">Показывать конфетти при выполнении</Label>
                  <Switch
                    id="show-confetti"
                    checked={localSettings.showConfetti}
                    onCheckedChange={(checked) => updateSetting("showConfetti", checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Показывать анимацию празднования при выполнении привычки
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-notifications">Включить уведомления</Label>
                  <Switch
                    id="enable-notifications"
                    checked={localSettings.enableNotifications}
                    onCheckedChange={(checked) => updateSetting("enableNotifications", checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Получать напоминания о выполнении привычек</p>
              </div>

              {localSettings.enableNotifications && (
                <>
                  <div className="space-y-2">
                    <Label>Частота напоминаний</Label>
                    <RadioGroup
                      value={localSettings.reminderFrequency}
                      onValueChange={(value: "daily" | "weekly" | "never") => updateSetting("reminderFrequency", value)}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily-reminder" />
                        <Label htmlFor="daily-reminder">Ежедневно</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly-reminder" />
                        <Label htmlFor="weekly-reminder">Еженедельно</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="never" id="never-reminder" />
                        <Label htmlFor="never-reminder">Никогда</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-time">Время уведомления</Label>
                    <Select
                      value={localSettings.notificationTime}
                      onValueChange={(value) => updateSetting("notificationTime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {`${hour}:00`}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-progress">Делиться прогрессом</Label>
                  <Switch
                    id="share-progress"
                    checked={localSettings.shareProgress}
                    onCheckedChange={(checked) => updateSetting("shareProgress", checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Разрешить делиться прогрессом с друзьями и семьей</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить изменения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

