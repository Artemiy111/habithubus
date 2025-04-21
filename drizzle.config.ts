import type { Config } from "drizzle-kit"

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL не указан в переменных окружения")
}

export default <Config>{
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
}

