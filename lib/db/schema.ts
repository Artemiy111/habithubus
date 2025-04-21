import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// Таблица пользователей
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  githubId: text('github_id').unique(), // Добавляем поле для GitHub ID
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
})

// Обновляем схему привычек, добавляя поле status
export const habits = sqliteTable('habits', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  frequency: text('frequency', {
    enum: ['daily', 'weekly', 'monthly'],
  }).notNull(),
  status: text('status', { enum: ['useful', 'harmful', 'neutral'] })
    .default('useful')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
})

export const completions = sqliteTable('completions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  habitId: text('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull(),
})

export const userSettings = sqliteTable('user_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
  primaryColor: text('primary_color').default('blue'),
  enableNotifications: integer('enable_notifications', {
    mode: 'boolean',
  }).default(false),
  notificationTime: text('notification_time').default('20:00'),
  showConfetti: integer('show_confetti', { mode: 'boolean' }).default(true),
  shareProgress: integer('share_progress', { mode: 'boolean' }).default(false),
  reminderFrequency: text('reminder_frequency', {
    enum: ['daily', 'weekly', 'never'],
  }).default('daily'),
})

// Добавляем таблицу для хранения достижений пользователя
export const userAchievements = sqliteTable('user_achievements', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull(), // ID достижения (например, "first-habit")
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
})

// Определяем отношения между таблицами
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  settings: many(userSettings),
  achievements: many(userAchievements),
}))

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  completions: many(completions),
}))

export const completionsRelations = relations(completions, ({ one }) => ({
  habit: one(habits, {
    fields: [completions.habitId],
    references: [habits.id],
  }),
}))

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}))
