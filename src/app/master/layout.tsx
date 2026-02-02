'use client'

import React from 'react'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, AppBar, Toolbar, Typography, CssBaseline, Button } from '@mui/material'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const drawerWidth = 240

export default function MasterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const supabase = createClient()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'primary.main' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap component="div">
                        BeautyPass Master
                    </Typography>
                    <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/master/dashboard">
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/procedures/new">
                                <ListItemText primary="New Procedure" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
}
