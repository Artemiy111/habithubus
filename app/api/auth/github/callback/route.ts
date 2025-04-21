import { type NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth/utils'
import { getUserByEmail, createUser, createUserSettings } from '@/lib/db/actions'

export async function GET(request: NextRequest) {
  try {
    // Получаем код и состояние из URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // Проверяем, что код и состояние существуют
    if (!code) {
      console.error('No code provided in GitHub callback')
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    if (!state) {
      console.error('No state provided in GitHub callback')
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
    }

    // Получаем токен доступа от GitHub
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to get access token from GitHub', await tokenResponse.text())
      return NextResponse.redirect(new URL('/login?error=token_error', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Получаем данные пользователя от GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get user data from GitHub', await userResponse.text())
      return NextResponse.redirect(new URL('/login?error=user_error', request.url))
    }

    const userData = await userResponse.json()

    // Получаем email пользователя
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!emailsResponse.ok) {
      console.error('Failed to get user emails from GitHub', await emailsResponse.text())
      return NextResponse.redirect(new URL('/login?error=email_error', request.url))
    }

    const emails = await emailsResponse.json()
    const primaryEmail = emails.find((email: any) => email.primary)?.email

    if (!primaryEmail) {
      console.error('No primary email found in GitHub response')
      return NextResponse.redirect(new URL('/login?error=email_error', request.url))
    }

    // Проверяем, существует ли пользователь с таким email
    let user = null
    try {
      user = await getUserByEmail(primaryEmail)
    } catch (error) {
      console.error('Error checking if user exists:', error)
    }

    // Если пользователь не существует, создаем его
    if (!user) {
      try {
        user = await createUser({
          email: primaryEmail,
          name: userData.name || userData.login,
          githubId: userData.id.toString(),
        })

        // Создаем настройки по умолчанию
        await createUserSettings(user.id)
      } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.redirect(new URL('/login?error=github_auth_error', request.url))
      }
    } else if (!user.githubId) {
      // Если пользователь существует, но не имеет githubId, обновляем его
      // Это не реализовано в текущем коде, но может быть добавлено при необходимости
    }

    // Создаем сессию
    const response = NextResponse.redirect(new URL('/', request.url))
    await createSession(user.id, response)
    console.log(`GitHub auth successful for user: ${user.id}`)

    return response
  } catch (error) {
    console.error('Error in GitHub callback:', error)
    return NextResponse.redirect(new URL('/login?error=github_auth_error', request.url))
  }
}
