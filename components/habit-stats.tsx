"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, AlertTriangle, Minus } from "lucide-react"
import type { Habit, HabitCompletion } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface HabitStatsProps {
  habits: Habit[]
  completions: HabitCompletion[]
}

export default function HabitStats({ habits, completions }: HabitStatsProps) {
  // Calculate completion rate for the last 30 days
  const last30DaysStats = useMemo(() => {
    if (habits.length === 0) return []

    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    return habits.map((habit) => {
      // Count possible completion days based on frequency
      let possibleDays = 0
      let possibleWeeks = 0

      if (habit.frequency === "daily") {
        possibleDays = 30
      } else if (habit.frequency === "weekly") {
        possibleWeeks = 4 // Approximately 4 weeks in 30 days
        possibleDays = possibleWeeks * 7
      } else if (habit.frequency === "monthly") {
        possibleDays = 1
      }

      // Get completions in the last 30 days
      const habitCompletions = completions.filter((c) => {
        const completionDate = new Date(c.date)
        return c.habitId === habit.id && completionDate >= thirtyDaysAgo && completionDate <= today
      })

      const completionCount = habitCompletions.length

      // For weekly habits, calculate weeks with at least one completion
      let weeksWithCompletions = 0
      let completionRate = 0

      if (habit.frequency === "weekly") {
        // Group completions by week
        const weekMap = new Map()

        // Initialize all weeks
        for (let i = 0; i < possibleWeeks; i++) {
          const weekStart = new Date(thirtyDaysAgo)
          weekStart.setDate(weekStart.getDate() + i * 7)
          const weekKey =
            weekStart.toISOString().split("T")[0].substring(0, 7) + "-W" + Math.ceil(weekStart.getDate() / 7)
          weekMap.set(weekKey, false)
        }

        // Mark weeks with completions
        habitCompletions.forEach((completion) => {
          const completionDate = new Date(completion.date)
          const weekNumber = Math.ceil(completionDate.getDate() / 7)
          const weekKey = completionDate.toISOString().split("T")[0].substring(0, 7) + "-W" + weekNumber
          weekMap.set(weekKey, true)
        })

        // Count weeks with at least one completion
        weeksWithCompletions = Array.from(weekMap.values()).filter(Boolean).length

        // Calculate completion rate based on weeks with completions
        completionRate = possibleWeeks > 0 ? Math.round((weeksWithCompletions / possibleWeeks) * 100) : 0
      } else {
        // For daily and monthly habits, calculate completion rate normally
        completionRate = possibleDays > 0 ? Math.round((completionCount / possibleDays) * 100) : 0
      }

      return {
        id: habit.id,
        name: habit.name,
        completionCount,
        possibleDays,
        possibleWeeks,
        weeksWithCompletions,
        completionRate,
        frequency: habit.frequency,
        status: habit.status || "useful",
      }
    })
  }, [habits, completions])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (habits.length === 0) return { completionRate: 0, totalCompletions: 0 }

    const totalCompletions = completions.length

    // Calculate overall completion rate considering weekly habits differently
    let totalPossible = 0
    let totalCompleted = 0

    last30DaysStats.forEach((stat) => {
      if (stat.frequency === "weekly") {
        totalPossible += stat.possibleWeeks
        totalCompleted += stat.weeksWithCompletions
      } else {
        totalPossible += stat.possibleDays
        totalCompleted += stat.completionCount
      }
    })

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

    return { completionRate, totalCompletions }
  }, [habits, completions, last30DaysStats])

  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Get the last 7 days
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      last7Days.push({
        date: date.toISOString().split("T")[0],
        displayDate: date.toLocaleDateString("ru-RU", { weekday: "short" }),
      })
    }

    // Count completions for each day
    return last7Days.map((day) => {
      const dayCompletions = completions.filter((c) => c.date === day.date).length
      return {
        name: day.displayDate,
        completions: dayCompletions,
      }
    })
  }, [completions])

  // Find the most consistent habit
  const mostConsistentHabit = useMemo(() => {
    if (last30DaysStats.length === 0) return null

    return last30DaysStats.reduce((prev, current) => (current.completionRate > prev.completionRate ? current : prev))
  }, [last30DaysStats])

  // Group habits by status
  const habitsByStatus = useMemo(() => {
    const grouped = {
      useful: habits.filter((h) => h.status === "useful"),
      harmful: habits.filter((h) => h.status === "harmful"),
      neutral: habits.filter((h) => h.status === "neutral"),
    }

    return grouped
  }, [habits])

  // Calculate completion stats by status
  const completionsByStatus = useMemo(() => {
    const habitIds = {
      useful: habitsByStatus.useful.map((h) => h.id),
      harmful: habitsByStatus.harmful.map((h) => h.id),
      neutral: habitsByStatus.neutral.map((h) => h.id),
    }

    const statusCompletions = {
      useful: completions.filter((c) => habitIds.useful.includes(c.habitId)).length,
      harmful: completions.filter((c) => habitIds.harmful.includes(c.habitId)).length,
      neutral: completions.filter((c) => habitIds.neutral.includes(c.habitId)).length,
    }

    // Фильтруем категории с нулевыми значениями
    const pieChartData = [
      { name: "Полезные", value: statusCompletions.useful, color: "#22c55e" },
      { name: "Вредные", value: statusCompletions.harmful, color: "#ef4444" },
      { name: "Нейтральные", value: statusCompletions.neutral, color: "#6b7280" },
    ].filter((item) => item.value > 0 || (item.name === "Полезные" && habitsByStatus.useful.length > 0))

    return { habitIds, statusCompletions, pieChartData }
  }, [habitsByStatus, completions])

  // Get stats for each status category
  const statsByStatus = useMemo(() => {
    return {
      useful: last30DaysStats.filter((stat) => stat.status === "useful"),
      harmful: last30DaysStats.filter((stat) => stat.status === "harmful"),
      neutral: last30DaysStats.filter((stat) => stat.status === "neutral"),
    }
  }, [last30DaysStats])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Общая статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Общий процент выполнения</span>
                <span className="text-sm font-medium">{overallStats.completionRate}%</span>
              </div>
              <Progress value={overallStats.completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{overallStats.totalCompletions}</div>
                <div className="text-sm text-muted-foreground">Всего выполнений</div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold">{habits.length}</div>
                <div className="text-sm text-muted-foreground">Активных привычек</div>
              </div>
            </div>

            {mostConsistentHabit && (
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Самая стабильная привычка</div>
                <div className="text-lg font-medium">{mostConsistentHabit.name}</div>
                <div className="text-sm">{mostConsistentHabit.completionRate}% выполнения</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Привычки по статусу</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center">
              <Leaf className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-xl font-bold">{habitsByStatus.useful.length}</div>
                <div className="text-sm text-muted-foreground">Полезные привычки</div>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <div className="text-xl font-bold">{habitsByStatus.harmful.length}</div>
                <div className="text-sm text-muted-foreground">Вредные привычки</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-center">
              <Minus className="h-8 w-8 text-gray-500 mr-3" />
              <div>
                <div className="text-xl font-bold">{habitsByStatus.neutral.length}</div>
                <div className="text-sm text-muted-foreground">Нейтральные привычки</div>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionsByStatus.pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {completionsByStatus.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} выполнений`, "Количество"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Активность за последние 7 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Производительность привычек</CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Нет привычек для отображения статистики.</div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="useful" className="flex items-center gap-1">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <span>Полезные</span>
                </TabsTrigger>
                <TabsTrigger value="harmful" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Вредные</span>
                </TabsTrigger>
                <TabsTrigger value="neutral" className="flex items-center gap-1">
                  <Minus className="h-4 w-4 text-gray-500" />
                  <span>Нейтральные</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {last30DaysStats.map((stat) => (
                  <div key={stat.id} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{stat.name}</span>
                      <span className="text-sm font-medium">{stat.completionRate}%</span>
                    </div>
                    <Progress value={stat.completionRate} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {stat.frequency === "weekly" ? (
                        <>
                          {stat.weeksWithCompletions} из {stat.possibleWeeks} недель. {stat.completionCount} раз
                        </>
                      ) : (
                        <>
                          {stat.completionCount} из {stat.possibleDays} {stat.possibleDays === 1 ? "дня" : "дней"}{" "}
                          выполнено
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="useful" className="space-y-4">
                {statsByStatus.useful.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Нет полезных привычек для отображения.</div>
                ) : (
                  statsByStatus.useful.map((stat) => (
                    <div key={stat.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{stat.name}</span>
                        <span className="text-sm font-medium">{stat.completionRate}%</span>
                      </div>
                      <Progress value={stat.completionRate} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {stat.frequency === "weekly" ? (
                          <>
                            {stat.weeksWithCompletions} из {stat.possibleWeeks} недель. {stat.completionCount} раз
                          </>
                        ) : (
                          <>
                            {stat.completionCount} из {stat.possibleDays} {stat.possibleDays === 1 ? "дня" : "дней"}{" "}
                            выполнено
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="harmful" className="space-y-4">
                {statsByStatus.harmful.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Нет вредных привычек для отображения.</div>
                ) : (
                  statsByStatus.harmful.map((stat) => (
                    <div key={stat.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{stat.name}</span>
                        <span className="text-sm font-medium">{stat.completionRate}%</span>
                      </div>
                      <Progress value={stat.completionRate} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {stat.frequency === "weekly" ? (
                          <>
                            {stat.weeksWithCompletions} из {stat.possibleWeeks} недель. {stat.completionCount} раз
                          </>
                        ) : (
                          <>
                            {stat.completionCount} из {stat.possibleDays} {stat.possibleDays === 1 ? "дня" : "дней"}{" "}
                            выполнено
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="neutral" className="space-y-4">
                {statsByStatus.neutral.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Нет нейтральных привычек для отображения.
                  </div>
                ) : (
                  statsByStatus.neutral.map((stat) => (
                    <div key={stat.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{stat.name}</span>
                        <span className="text-sm font-medium">{stat.completionRate}%</span>
                      </div>
                      <Progress value={stat.completionRate} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {stat.frequency === "weekly" ? (
                          <>
                            {stat.weeksWithCompletions} из {stat.possibleWeeks} недель. {stat.completionCount} раз
                          </>
                        ) : (
                          <>
                            {stat.completionCount} из {stat.possibleDays} {stat.possibleDays === 1 ? "дня" : "дней"}{" "}
                            выполнено
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

