'use client'

import React from 'react'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, AppBar, Toolbar, Typography, CssBaseline, Button } from '@mui/material'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const drawerWidth = 260

export default function MasterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const supabase = createClient()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(149, 117, 205, 0.08)'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{
                            fontFamily: 'var(--font-playfair), serif',
                            color: 'primary.dark',
                            fontWeight: 700
                        }}
                    >
                        BeautyPass <Box component="span" sx={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.6, ml: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Master</Box>
                    </Typography>
                    <Button
                        onClick={handleSignOut}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.dark' } }}
                    >
                        Sign Out
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        bgcolor: 'background.default',
                        borderRight: '1px solid rgba(149, 117, 205, 0.08)'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List sx={{ px: 2 }}>
                        {[
                            { text: 'Dashboard', href: '/master/dashboard' },
                            { text: 'New Procedure', href: '/procedures/new' },
                        ].map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    sx={{
                                        borderRadius: 3,
                                        '&.Mui-selected': { bgcolor: 'primary.light' },
                                        '&:hover': { bgcolor: 'primary.light', opacity: 0.7 }
                                    }}
                                >
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: 500,
                                            color: 'text.primary',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
                {children}
            </Box>
        </Box>
    )
}
