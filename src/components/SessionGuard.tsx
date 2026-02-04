'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const IDLE_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export default function SessionGuard() {
    const router = useRouter()
    const supabase = createClient()
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS)
        }

        const handleLogout = async () => {
            // Check if we actually have a session first to avoid unnecessary calls
            //   const { data: { session } } = await supabase.auth.getSession()
            //   if (!session) return

            console.log('SessionGuard: Idle timeout reached. Logging out.')
            await supabase.auth.signOut()
            router.push('/login?error=Session expired due to inactivity')
        }

        // Events to monitor
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

        // Attach listeners
        events.forEach(event => document.addEventListener(event, resetTimer))

        // Start timer immediately
        resetTimer()

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            events.forEach(event => document.removeEventListener(event, resetTimer))
        }
    }, [router, supabase])

    return null // Render nothing
}
