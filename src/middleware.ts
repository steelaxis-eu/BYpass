import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase Env Vars missing in middleware. Skipping session check.')
            return supabaseResponse
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()


        if (
            !user &&
            !request.nextUrl.pathname.startsWith('/login') &&
            !request.nextUrl.pathname.startsWith('/auth') &&
            request.nextUrl.pathname !== '/'
        ) {
            // Redirect unauthenticated users to login
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        if (user) {
            // Use Service Role for Profile Check to bypass RLS recursion/issues
            // This is safe because we trust the 'user.id' from auth.getUser()
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            let role = 'client' // Default

            if (serviceRoleKey) {
                // Create a sudo client specific for this request to check permissions
                const sudo = createServerClient(
                    supabaseUrl,
                    serviceRoleKey,
                    { cookies: { getAll() { return [] }, setAll() { } } }
                )

                const { data: profile, error } = await sudo
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role) role = profile.role
                if (error) console.error('Middleware Role Check Error:', error.message)
            } else {
                console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY missing in middleware. Admin checks may fail.')
            }

            // 1. RBAC: Protect Admin Routes
            if (request.nextUrl.pathname.startsWith('/admin')) {
                // console.log('Middleware Admin Check:', { path: request.nextUrl.pathname, userId: user.id, role })
                if (role !== 'admin') {
                    return NextResponse.redirect(new URL('/master/dashboard?error=Unauthorized', request.url))
                }
            }

            // 2. RBAC: Protect Master Routes (Optional: if clients shouldn't see it)
            if (request.nextUrl.pathname.startsWith('/master')) {
                if (!['admin', 'master'].includes(role)) {
                    return NextResponse.redirect(new URL('/?error=Unauthorized', request.url))
                }
            }
        }

        return supabaseResponse
    } catch (e) {
        // Ignore middleware errors to prevent 404/500 on Vercel
        return NextResponse.next({
            request,
        })
    }
}

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
