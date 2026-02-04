'use client'

import { AppBar, Toolbar, Button, Box, Container } from '@mui/material'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import LogoutIcon from '@mui/icons-material/Logout'

export default function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // Hide navigation on landing page
    if (pathname === '/') return null

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                        <Button
                            component={Link}
                            href="/master/dashboard"
                            color={pathname.startsWith('/master') ? 'primary' : 'inherit'}
                            sx={{ fontWeight: pathname.startsWith('/master') ? 'bold' : 'normal' }}
                        >
                            Dashboard
                        </Button>
                        <Button
                            component={Link}
                            href="/procedures"
                            color={pathname.startsWith('/procedures') ? 'primary' : 'inherit'}
                            sx={{ fontWeight: pathname.startsWith('/procedures') ? 'bold' : 'normal' }}
                        >
                            Procedures Done
                        </Button>
                    </Box>

                    <Button
                        onClick={handleLogout}
                        color="inherit"
                        startIcon={<LogoutIcon />}
                        size="small"
                    >
                        Log Out
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    )
}
