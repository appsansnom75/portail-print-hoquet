import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // --- BLOCAGE MAINTENANCE (vérifié en premier) ---
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1] || ''
    const [user, pwd] = atob(authValue).split(':')

    if (
      user !== process.env.BASIC_AUTH_USER ||
      pwd !== process.env.BASIC_AUTH_PASSWORD
    ) {
      return new Response('Site en maintenance', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Maintenance"',
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }
  } else {
    return new Response('Site en maintenance', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Maintenance"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  // --- LOGIQUE SUPABASE EXISTANTE (inchangée) ---
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
}