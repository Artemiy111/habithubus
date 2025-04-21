import { type NextRequest, NextResponse } from "next/server"

// Генерируем случайную строку для state
function generateState() {
  return Math.random().toString(36).substring(2, 15)
}

// Обработчик для начала процесса авторизации через GitHub
export async function GET(request: NextRequest) {
  // Получаем URL-параметры
  const searchParams = request.nextUrl.searchParams
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  // Генерируем state для защиты от CSRF
  const state = generateState()

  // Сохраняем state и callbackUrl в cookie
  const response = NextResponse.redirect(getGitHubAuthURL(state))
  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 минут
    path: "/",
  })
  response.cookies.set("github_callback_url", callbackUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 минут
    path: "/",
  })

  return response
}

// Функция для получения URL авторизации GitHub
function getGitHubAuthURL(state: string) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    throw new Error("GitHub Client ID не настроен")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/github/callback`,
    scope: "read:user user:email",
    state,
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

