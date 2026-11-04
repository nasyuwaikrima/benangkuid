import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Proteksi Halaman yang butuh Login
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const { data: shop } = await supabase
      .from('shops')
      .select('is_onboarded, subscription_status, trial_ends_at, pro_valid_until')
      .eq('id', user.id)
      .single()

    // 2. Routing Logic Onboarding
    if (shop) {
      if (!shop.is_onboarded && !pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      if (shop.is_onboarded && pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // 3. Subscription & Trial Guard (Kunci API write jika habis)
      const now = new Date()
      const isTrialExpired = shop.subscription_status === 'trialing' && new Date(shop.trial_ends_at) < now
      const isProExpired = shop.subscription_status === 'active' && shop.pro_valid_until && new Date(shop.pro_valid_until) < now

      if ((isTrialExpired || isProExpired) && request.method !== 'GET' && pathname.startsWith('/api')) {
        return NextResponse.json(
          {
            error: 'TRIAL_EXPIRED',
            message: 'Masa trial 14 hari telah habis. Upgrade ke Plan Pro untuk menambah data baru.',
          },
          { status: 403 }
        )
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/api/:path*'],
}
