import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Пути, которые не требуют аутентификации
const publicPaths = ['/login', '/register']

// Пути, которые всегда должны быть доступны
const allowedPaths = ['/api', '/_next', '/favicon.ico', '/assets', '/images']

export function middleware(request: NextRequest) {
  // Получаем текущий путь
  const { pathname } = request.nextUrl

  // Проверяем, является ли путь разрешенным (API, статические ресурсы и т.д.)
  if (allowedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Проверяем, является ли путь публичным
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Получаем сессию из куки
  const session = request.cookies.get('session')

  // Логируем для отладки (можно удалить в продакшн)
  console.log(`Path: ${pathname}, Session: ${session ? 'exists' : 'none'}, Public: ${isPublicPath}`)

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному пути
  if (!session && !isPublicPath) {
    console.log(`Redirecting to /login from ${pathname}`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Если пользователь аутентифицирован и пытается получить доступ к странице входа или регистрации
  if (session && isPublicPath) {
    console.log(`Redirecting to / from ${pathname}`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Обновляем конфигурацию matcher, чтобы исключить больше путей
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts, /icons, /images (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next/static|_next/image|fonts|icons|images|favicon.ico|sitemap.xml).*)',
  ],
}
